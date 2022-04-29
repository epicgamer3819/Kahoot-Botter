const express = require('express');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = 8080;
var Kahoot = require("kahoot.js-updated");
app.get("/", (_, res) => res.sendFile(__dirname + "/views/index.html"))
server.listen(port, () => {
  console.log('Server listening at port %d', port);
});
app.use(express.static(path.join(__dirname, 'public')));

const spam = (pin, amount, name) => {
  let i = 0;
  const a = setInterval(() => {
    const j = i++;
    const { client, event } = Kahoot.join(pin, name + (i++));
    event.then(() => {
      console.log(name + j + " Joined!");
      io.emit('updatelog', { message: `${name + j} Joined!` })
    }).catch((e) => {
      console.log(name + j + " Failed to join:");
      console.log(e);
      client.leave();
    });
    client.on("Disconnect", (reason) => {
      message = `${name + j} disconnected: ${reason}`
      console.log(message);
      io.emit('updatelog', { message: message })
    });
    client.on("QuizStart", (quiz) => {
      console.log("The Quiz Has Started.");
      io.emit('updatelog', { message: 'The Quiz Has Started.' })
      console.log(quiz);
      console.log(client.quiz);
    });
    client.on("QuestionStart", question => {
      let answer = Math.floor(Math.random() * 4)
      let message = `question started. ${name + j} answered ${answer}`
      console.log(message);
      io.emit('updatelog', { message: message })
      question.answer(answer);
    });
    if (i >= amount) {
      clearInterval(a);
    }
  }, 35);
};
io.on('connection', socket => {
  socket.on('send_spam', (pin, amount, name) => {
    spam(pin, amount, name)
  })
})




