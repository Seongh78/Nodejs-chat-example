//socket.io 팩키지 참조
const SocketIO = require('socket.io');
const redis = require('socket.io-redis');

//socket.js모듈 기능정의
module.exports = (server) => {
  // express서버와 socket.io객체 연결 // path => 클라이언트와의 통신경로
  // const io = SocketIO(server, { path: '/socket.io' });
  // CORS 환경 지원 IO객체 생성하기
  const io = SocketIO(server, {
    path: '/socket.io',
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  //Redis Backplain 연결설정
  io.adapter(
    redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      // host: '127.0.0.1',
      // port: '6379',
    })
  );

  //socket.io connection 이벤트 정의 추가
  //웹브라우저와 웹서버(express)간 소켓통신 연결이 완료되면 발생하는 connection 이벤트 기능정의
  //웹브라우저와 웹서버가 연결된상태 발생하는 모든 기능을 콜백함수안에서 구현한다.
  io.on('connection', (socket) => {
    //브라우저에서 호출되는 서버측 기능1
    //기능이름은 임으로적으로 정의하며 해당 기능이 호출될때 콜백함수가 실행된다.
    //콜백함수가 호출될떄 브라우저에서 전달한 값을 파라메터로 수신받는다.
    socket.on('broadcast', (msg) => {
      //브라우저에서 전송된 msg데이터를 현재 연결된 모든 사용자 브라우저에게 전송한다.
      //receiveAll은 브라우저에서 서버로부터 전송된 메시지를 받을 기능명이다.
      io.emit('receiveAll', msg);
      //socket.broadcast.emit("receive",msg);
    });

    /* 전체채팅: 테스트CASE2 */
    //샘플용 서버 수신기 - test1 기능정의
    socket.on('test1', function (param1, param2) {
      //현재 웹서버에 연결된 모든사용자에게 receive1 수신기로 param1 값을 전송함
      io.emit('receive1', param1, param2);
    });

    /* 전체채팅: 테스트CASE3 */
    //샘플용 서버 수신기 - test2 기능정의
    socket.on('test2', function (jsonData) {
      //현재 웹서버에 연결된 모든사용자에게 receive1 수신기로 param1 값을 전송함
      io.emit('receive2', jsonData);
    });

    /* 그룹채팅: 채팅방 입장하기 */
    //그룹채팅 채팅방 입장하기
    socket.on('entry', function (roomId, nickName) {
      socket.join(roomId);
      //현재 입장 사용자에게만 메시지를 전송한다.
      socket.emit('entryok', `${nickName}님으로 입장했습니다.`);

      //현재 접속자를 제외한 같은 채팅방내 모든 사용자에게 메시지 발송
      socket
        .to(roomId)
        .emit('entryok', `${nickName}님이 채팅방에 입장했습니다`);
    });

    /* 그룹채팅: 채팅방 클라이언트 메시지 수신 및 클라이언트로 발신처리하기 */
    //그룹 메시징 수신 및 발송
    socket.on('groupmsg', function (roomId, msg) {
      //그룹채팅방 사용자에게만 메시지를 발송한다.
      //서버에 연결된 모든사용자가 아닌 지정 채팅방에 입장한 모든사용자에게
      // 메시지를 보낼떄는 io.to(채팅방아이디값).emit()
      io.to(roomId).emit('receiveGroupMsg', roomId, msg);
    });

    //스몰그룹채팅: 채팅방 클라이언트 메시지 수신 및 클라이언트로 발신처리하기
    //그룹 메시징 수신 및 발송
    socket.on('smallmsg', function (roomId, nickName, msg) {
      io.to(roomId).emit('receiveSmallMsg', nickName, msg);
    });
  }); // io close
};
