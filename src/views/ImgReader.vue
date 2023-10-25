<template>
  <div id="imgreader">
    <div class="container is-fluid" style="padding:1.5rem; background: var(--whiteish)">
      <div class="columns">
          <div class="column" ><br>
            <div id="read-file" class="file is-small has-name is-info">
              <label class="file-label">
                <input class="file-input" type="file" name="upload_file">
                <span class="file-cta cta-color">
                  <span class="file-icon">
                    <i class="fas fa-upload"></i>
                  </span>
                  <span class="file-label">
                    Choose a file…
                  </span>
                </span>
                <span class="file-name" style="background: white">
                  No file uploaded
                </span>
              </label>
            </div>
            <br><br><br>
            <button class="button is-large is-primary is-outlined" 
              :class="is_waiting?'is-loading':''" 
              @click="uploadToCIMP()"
              :disabled="!has_file">
              <span class="icon is-medium">
                <i class="fas fa-file-export"></i>
              </span>
            </button>
            <br>
            <span>Send File</span>
            
          </div>
          <div class="column is-two-thirds">
            <div v-show="multi_page" class="tabs is-boxed is-small">
              <ul v-for="(val,key) in image_text" :key="key">
                <li :class="curr_key==key? 'is-active': ''">
                  <a @click="set_curr_key(key)">
                    <span class="icon is-small"><i class="fas fa-file" aria-hidden="true"></i></span>
                    <span>{{key}}</span>
                  </a>
                </li>
              </ul>
            </div>
            <div class="field text-fields">
              <div class="control full-width" :class="is_waiting?'is-loading':''">
                <textarea v-if="image_text" class="textarea is-primary is-small" rows="20" readonly>{{ curr_text }}
                </textarea>
                <textarea v-else class="textarea is-primary is-small" :placeholder="is_waiting? 'Waiting for response...' : 'File not processed yet'" rows="20" readonly>
                </textarea>
              </div>
            </div>
          </div>
          
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
          <p class="text home-msg--text"><strong style="color:var(--green)">This page scans an image or PDF to see if there are any texts to be detected</strong><br>The texts detected will be displayed on the right side of the screen<br></p>
        </div>
      </div>
    </div>
    <div class="modal is-clipped" :class="(show_modal)?'is-active':''">
      <div class="modal-background"></div>
      <div class="modal-content">
        <div class="notification is-danger">
          <button class="delete is-large" @click="hideModal"></button>
          An <strong>Error</strong> was encountered during upload. Try uploading the file again after some time.
        </div>
      </div>
    </div>

    
  </div>
</template>

<script>
export default {
  name: 'ImgReader',
  data() {
    return{
      is_waiting: false,
      show_modal: false,
      file_input: null,
      image_text: '',
      has_file: false,
      curr_key: 'Page 1',
      multi_page: false,
    }
  },
  created() {
  },
  mounted(){

    this.file_input = document.querySelector('#read-file input[type=file]');
    this.file_input.onchange = () => {
      if (this.file_input.files.length > 0) {
        const fileName = document.querySelector('#read-file .file-name');
        fileName.textContent = this.file_input.files[0].name;
        this.has_file=true;
      }
    }
  },
  computed: {
    curr_text() {
      return this.image_text[this.curr_key]
    }
  },
  methods: {
    hideModal() {
      this.show_modal = false;
    },
    set_curr_key(key) {
      this.curr_key = key
    },
    process_api_response(data){
      let data_dict = {}
      let first_key = null
      for (let key in data) {
        let texts = ''
        let texts_arr = data[key]
        for (let i=0; i<texts_arr.length; i++) {
          texts += texts_arr[i]
          texts += '\n'
        }
        let new_key = key.replace('pg', 'Page ')
        first_key = first_key || new_key
        data_dict[new_key] = texts
      }
      return data_dict
    },
    uploadToCIMP() {
      const ImgReader_URL = "http://cimp.factset.io/detect/img-reader"
      // const ImgReader_URL = "http://127.0.0.1:5000/detect/img-reader"
      this.is_waiting = true;
      this.image_text=''
      const xhr = new XMLHttpRequest();
      let formdata = new FormData();

      let self = this
      xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
          self.is_waiting = false;
          try {
            let response = JSON.parse(this.responseText);
            if(response['text'].hasOwnProperty('pg1')) {
              self.image_text = self.process_api_response(response['text'])
              for (let key in self.image_text){
                self.curr_key = key
                break
              }
              if(response['text'].hasOwnProperty('pg2')) {
                self.multi_page = true;
              }              
            } else {
              self.show_modal = true;
            }
          } catch {
            self.show_modal = true;
          }
        }
      });
      formdata.append("file", this.file_input.files[0]);
      xhr.open("POST", ImgReader_URL);
      xhr.send(formdata);
    },
  },
  components: {
  }
}
</script>

<style scoped>
.text-fields {
  width:100%;
}

td {
  padding: 0.35rem;
  vertical-align: middle;
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

.home-i {
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
