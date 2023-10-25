module.exports = {
  devServer: {
    historyApiFallback: true
  },
  publicPath: process.env.NODE_ENV === "production" ? "/REPO_NAME/" : "/",
}
