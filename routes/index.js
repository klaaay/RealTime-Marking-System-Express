module.exports = function (app) {
  app.get('/',function(req,res,next){
    res.render('index')
  })
  app.use('/show',require('./show.js'))
  app.use('/judge',require('./judge.js'))
}