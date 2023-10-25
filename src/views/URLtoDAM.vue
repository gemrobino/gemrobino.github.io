<template>
  <div>
    <div class="home" :style="'no-repeat;height: 100vh;width: 100%;background-size: cover;align-items: center;justify-content: center;'">
      <div class="home--img-overlay"></div>
      <div class="home--text-overlay">
        <h4 class="home--txt-description text">Upload a webpage and convert to PDF</h4>
        <div class="home--text-container is-centered">

          <label>Webpage Link</label>
          <div class="control has-icons-right">
            <input v-model="url_str" class="input is-rounded is-primary" type="text" placeholder="Enter URL" style="margin-right:1rem" required>
            <span v-if="url_str" class="icon is-small is-right">
              <i class="fas fa-check"></i>
            </span>
          </div>      

          <br>

          <div class='group-input'>
            <div class="field" style="margin-right:1rem">
              <label>Company Details</label>
              <div class="control has-icons-right">
                <input v-model="iconum" class="input is-rounded is-primary" type="text" placeholder="Enter Details" required>
                <span v-if="iconum" class="icon is-small is-right">
                  <i class="fas fa-check"></i>
                </span>
              </div>
            </div>       
            <div class="field">
              <label>Uploader</label>
              <div class="control has-icons-right">
                <input class="input is-rounded is-primary" type="text" :value="employee_name" required disabled>
                <span class="icon is-small is-right">
                  <i class="fas fa-check"></i>
                </span>
              </div>    
            </div>
          </div>
       

          <br>

          <div class="control">
            <!-- <label style="color:white">Classifier</label> -->
            <div class="select" style="align-items: center; vertical-align: middle; margin-left: 1rem;">
              <select v-model='classifier' class='form-control'>
                <option disabled selected='Select Classifier' value=''>Select Classifier</option>
                <option v-for="(item, idx) in classifiers" :key="idx">
                  {{ item }}
                </option>
              </select>
            </div>
          </div>

          <br>

          <button :disabled="invalid_fields" class="button is-primary" :class="(is_waiting)? 'is-loading':''" @click="uploadToDAM">Upload</button>
        </div>

        <div v-if="successful_upload" class="columns is-centered">
          <div class="column is-one-half">
            <article class="message">
              <div class="message-header" style="background:var(--black)">
                <p style="text-align:center;align-self:center">Webpage successfully uploaded!</p>
              </div>
              <div class="message-body" style="background:var(--whiteish)">
                <input id="doc_id" class="input is-rounded" type="text" :value="new_doc_id" readonly>
              </div>
              <footer class="card-footer">
                <a @click="copyText" class="card-footer-item card-link" style="text-decoration: none;">Copy Doc ID</a>
                <a :href="view_link" target="_blank" class="card-footer-item card-link" style="text-decoration: none;">View File</a>
              </footer>
            </article>
          </div>
        </div>
        <div class="block" style='margin-bottom: 5rem;'></div>
        <div class="block" style='margin-bottom: 5rem;'></div>
      </div>
    </div>


    <div>
      <div class="home-msg columns">
        <div class="column is-one-quarter center-box">
          <div class="icon-item--box">
            <img src="../../public/more_icons/dia1.png" class="icon-item--img">
          </div>
        </div>
        <div class="column">
          <div class="is-centered" style="display:flex; flex-wrap:wrap; justify-content: center">
            <div class="home-msg--title">
              <p class="">WHAT AM I LOOKING AT</p>
            </div>
          </div>
          <p class="text home-msg--text"><strong style="color:var(--green)">This page takes a URL from a webpage and uploads that webpage to DAM.</strong><br>The webpage will be converted to PDF format before being passed.<br>There are still some <strong style="color:var(--red)">bugs</strong> to work out but it should return the document ID shortly after. <br>Some further improvements could be made to accept more than one URL, probably separated by commas or semi-colons.</p>
        </div>
      </div>
    </div>
    <div class="modal is-clipped" :class="(show_modal) ? 'is-active' :''">
      <div class="modal-background"></div>
      <div class="modal-content">
        <div class="notification is-danger">
          <button class="delete is-large" @click="hideModal"></button>
          An <strong>Error</strong> was encountered during upload to DAM. Try uploading the webpage again after some time.
        </div>
      </div>
    </div>

    
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'URLtoDam',
  data() {
    return{
      url_str: '',
      iconum: '',
      new_doc_id: '',
      is_waiting: false,
      employee_id: CORELIB.Employee.EmployeeId,
      employee_name: CORELIB.Employee.FullName,
      successful_upload: false,
      view_link: '#',
      show_modal: false,
      classifier: '',
      classifiers: [

      'Homepage',
      'About us',
      'Products and services',
      'History',
      'Board',
      'People',
      'Team',
      'Timeline',
      'Chronology',
      ]
    }
  },
  created() {
    this.home_bg_url = require('../../public/images/home_bg.jpg')
  },
  computed: {
    invalid_fields() {
      if (this.classifier && this.iconum && this.url_str) {
        return false
      }
      return true
    },
  },
  methods: {
    valid_url(url_str) {
      return true
    },
    hideModal() {
      this.show_modal = false;
    },
    uploadToDAM() {
      //check if valid 
      console.log(this.classifier, this.iconum, this.url_str) 

      const HTML2PDF_URL = "http://busdesc-dam.content.primark-bus-desc.dev.us-east-1.aws.fdscloud.io/upload_url"
      const data =  JSON.stringify({
        "URL": this.url_str,
        "CLASSIFIER": this.classifier,
        "ICONUM": this.iconum,
        "EMPLOYEE_ID": this.employee_id
      });


      this.is_waiting = true;
      let self = this
      fetch(HTML2PDF_URL, {
        "method": "POST",
        "body": data
      })
      .then(response => {
        this.is_waiting = false
        if (response.status != 200) {
          console.log(response.status)
          return false
        }
        return response.json();
      })
      .then(function (responseAsJson) {
        if (!responseAsJson) {
          self.successful_upload = false;
          self.show_modal = true;
        } else {
          self.new_doc_id = responseAsJson
          self.successful_upload = true;
        }
        console.log(responseAsJson);
      })
      .catch(err => {
        this.is_waiting = false
        console.error(err);
      });


    },
    copyText() {
      let copyText = document.getElementById("doc_id");
      copyText.select();
      document.execCommand("copy");
      alert("Doc ID copied");
    }
  },
  components: {
  }
}
</script>

<style scoped>
  .field {
    margin-bottom: 0rem;
  }
  .group-input{
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
#home {
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
a,a:link, a:visited, a:active {
  text-decoration: none;
}
a:hover {
  text-decoration: none;
  background: var(--green);
}
.card-link {
  text-decoration: none;
}

.home--text-overlay{
  z-index:3;
}

.home {
  display: flex;
  object-fit: contain;
  overflow: hidden;
  height: 100vh;
  width: 100%;
  background-size: cover;
  align-items: center;
  justify-content: center;
  background: url('../../public/images/home_bg.jpg');
}

.home--img {
  height: 100vh;
  width: 100vw;
  display: flex;
  overflow: hidden;
  position: absolute;
}

.home--img-overlay {
  background-image: linear-gradient(to bottom, rgba(42, 0, 0, 0) 0%, rgba(34, 47, 62, 0.99));
  z-index: 2;
  position: absolute;
  height: 100vh;
  width: 100%;
  align-items: center;
  vertical-align: middle;
  overflow: hidden;

}

.home--text-container {
  padding: 0.2rem;
  border-radius: 2rem;
  width: auto;
}
.home--text-container:hover{
  cursor: pointer;
}

.home--txt-title {
  font-weight: bold;
  font-size: 5rem;
  text-align: center;
  letter-spacing: 0.35rem;
  color: var(--black);
}

.home--txt-description {
  font-weight: 100;
  font-size: 1.7rem;
  color: #fff;
  text-align: center;
  margin: 0.5rem 0 0.5rem 0;
}

.home--icon-container {
  background: #5B5151;
  padding: 0.5vw;
  border: solid #A2D5AB 0.5vw;
  border-radius: 50%;
  width: 9.5vw;
  height: 9.5vw;
  margin-top: 4vh;
  align-items: center;
}

.icon-item--box{
  width: 8rem;
  height: 8rem;
  margin: 0.5rem;
  padding: 1.3rem;
  border-radius: 50%;

  border: solid var(--green) 0.3rem;
  #background: var(--d-purp);
  overflow:hidden;
  display: flex;
}

.icon-item--img{
  width: 100%;
  height: auto;
  filter: invert(89%) sepia(26%) saturate(6066%) hue-rotate(105deg) brightness(91%) contrast(77%);
}

.center-box{
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-msg {
  background: var(--black);
  padding: 1rem 1rem 0.5rem 1rem;
}
.home-msg--title{
  border-radius: 5rem;
  border: solid var(--green) 0.2rem;
  padding: 0rem 1.2rem 0rem 1.2rem;
  background: var(--green);
  font-weight: bold;
  font-size: 1.2rem;
  margin-bottom: 0.8rem;
  display:flex;
  flex-direction:column;
  flex-wrap:wrap;
  letter-spacing: 0.14rem;
}

.home-msg--text{
  color: var(--whiteish);
  text-align: center;
  font-weight: 100;
  padding: 0rem 1.3rem 0rem 1.3rem;
}


</style>
