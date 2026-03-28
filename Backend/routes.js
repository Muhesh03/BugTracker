
//-----------------------------------------------------------

module.exports = function (app) {
  console.log('Hello from routes');

  app.all('/user/*', require("./api/controllers/users.js").router);
  app.all('/usergroup/*', require("./api/controllers/usergroup.js").router);
  app.all('/projects/*', require("./api/controllers/projects.js").router);

  app.all('/tickettype/*', require("./api/controllers/tickettypes.js").router);
  app.all('/ticketstatus/*', require("./api/controllers/ticketstatus.js").router);

  app.all('/ticketpriority/*', require("./api/controllers/ticketpriority.js").router);
  app.all('/tickettag/*', require("./api/controllers/tickettag.js").router);
  app.all('/issueticket/*', require("./api/controllers/issueticket.js").router);
  app.all('/dashboard/*', require("./api/controllers/dashboard.js").router);
  app.all('/liveticket/*', require("./api/controllers/liveticket.js").router);
  app.all('/liveticket-note/*', require("./api/controllers/liveticket_notes.js").router);
  // app.all('/chat/*', require("./api/controllers/chat.js").router);
  app.use('/chat', require("./api/controllers/chat.js").router);

  //app.all('/login/*', require("./api/controllers/login.js").router);
  app.use('/login', require("./api/controllers/login.js").router);


  app.use('/attachment', require("./api/controllers/attachment.js").router);
  app.use('/note', require("./api/controllers/note.js").router);
  app.use('/issueticket', require("./api/controllers/issueticket.js").router);
  app.use('/ticket-activity', require("./api/controllers/ticketActivity.js").router);


}