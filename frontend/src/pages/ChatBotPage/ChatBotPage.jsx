import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatHeader from "./ChatHeader";
import ChatMessageList from "./ChatMessageList";
import ChatInputBox from "./ChatInputBox";
import axios from "axios";

function ChatBotPage() {
   const navigate = useNavigate();
   const [messages, setMessages] = useState([
      {
         id: 1,
         sender: "bot",
         text: "안녕하세요. 화재 행동요령 도우미 챗봇입니다. 아래에서 대피 상황을 선택하거나 궁금한 내용을 질문해주세요.",
      },
   ]);
   const [input, setInput] = useState("");
   const messagesEndRef = useRef(null);
   const apiUrl = import.meta.env.VITE_API_URL;

   // 대피 요령 데이터
   const fireGuides = {
      "아파트 화재 대피": `✅ 가족과 이웃에게 알리고 119에 신속히 신고하세요.
- 화재 위치, 동호수, 화재 상태, 갇힌 사람 여부를 정확히 전달합니다.

✅ 초기 진압이 어렵다면 신속하게 대피하세요.
- 젖은 수건으로 코와 입을 막고 낮은 자세로 이동합니다.
- 문 손잡이가 뜨거우면 문을 열지 말고 다른 경로를 찾으세요.
- 옷에 불이 붙었다면 눈과 입을 가리고 바닥에서 뒹굽니다.

✅ 대피 경로 선택
- 저층은 계단을 통해 대피, 옥상도 고려
- 경량칸막이를 파괴하여 옆집으로 대피 가능
- 창문으로 구조요청 또는 완강기 이용

✅ 기타 유의사항
- 엘리베이터는 절대 사용하지 마세요 (전원 차단 및 유독가스 위험)
- 방화문은 꼭 닫아 연기 확산을 막아야 합니다
- 휴대용 비상조명등 준비, 경량칸막이 주변에 물건 두지 않기
- 소화기, 옥내소화전 등을 이용해 초기진압 시도
`,

      "공연장 화재 대피": `✅ "불이야!" 외치거나 화재경보 비상벨을 눌러주세요.

✅ 대피 시 주의사항
- 안내원의 지시에 따라 낮은 자세로 천천히 이동
- 한 곳에 몰리지 않고 질서 있게 차례대로 대피
- 정전 시 자리에서 기다리며 안내를 따릅니다
- 구조요원 활동 방해하지 않도록 침착하게 이동
`,

      "산 화재 대피": `✅ 산불 발견 시 119, 112, 시·군·구청에 신고하세요.

✅ 대피 요령
- 바람 반대 방향, 저지대, 수풀이 적은 곳으로 이동
- 불길이 올 경우 타버린 지역이나 바위 뒤로 대피
- 대피가 불가능할 땐 낙엽 제거 후 엎드려 기다리기

✅ 주택가로 확산 시
- 창문 닫고 물 뿌리기, 가스통 제거, 공무원 안내 따라 이동
- 이웃에게도 상황을 알리기

✅ 산불 진화 참여
- 진화도구 준비(삽, 톱 등), 장비 착용
- 자율 참여 시 현장대책본부 안내를 따르세요
`,

      "고층건물 화재 대피": `✅ 화재 경보기를 누르고 119에 신고하세요.

✅ 대피 요령
- 문을 닫고 탈출 (열린 문도 닫기)
- 계단 이용, 엘리베이터 금지
- 안전한 장소에서 인원 확인

✅ 대피 불가능 시
- 창문 있는 방으로 들어가 구조 요청
- 문틈은 커튼 등으로 막고, 젖은 천으로 입과 코 가리기

✅ 사전 대비
- 장애인 등 대피가 어려운 사람은 도울 동료를 정해두기
`,

      "고속철도 화재 대피": `✅ 차량 인터폰으로 승무원에게 알리세요.

✅ 초기 조치
- 소화기 사용 가능 시 즉시 진화
- 코와 입을 수건, 옷 등으로 막고 안전한 객차로 이동

✅ 대피 요령
- 안내방송과 승무원 지시에 따라 승강문으로 대피
- 승강문이 안 열릴 경우 비상 망치로 창문 깨기

✅ 터널 내 대피
- 낮은 자세로 유도등 따라 비상대피소 이동
- 선로에 머무르지 말고 구호 차량 도착까지 대기
`,

      "도로 터널 화재 대피": `✅ 가능하면 차량과 함께 터널 밖으로 이동하세요.

✅ 이동이 불가능할 경우
- 갓길에 정차 후 키는 꽂은 채 하차
- 비상벨 또는 비상전화로 신고
- 소화기/소화전으로 초기 진화 시도

✅ 대피 시
- 유도등 따라 터널 외부로 빠르게 이동
`,

      "지하철 화재 대피": `📍 역사 내 화재 시
✅ 비상벨, 비상전화, 119로 신고
- 소화기·소화전으로 초기 진화
- 유도등 따라 낮은 자세로 대피

📍 열차 내 화재 시
✅ 비상통화장치로 승무원에게 알리기
- 119 신고 후 소화기로 진화
- 출입문 비상코크 사용 → 문 개방 후 탈출
- 선로 대피 시 전방 주의

✅ 유의사항
- 연기 많을 경우 반대 방향, 터널 쪽으로 이동
- 서로 손잡고 침착하게 이동
`,

      "지하상가 화재 대피": `✅ 침착하게 행동하세요.

✅ 대피 요령
- 한 방향을 정해 빠르게 이동
- 정전 시 유도등·벽·보도블록 따라 이동
- 연기 반대 방향, 공기 유입 방향으로 대피
- 빠른 판단으로 우왕좌왕하지 않기
`,
   };

   useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
   }, [messages]);

   // 버튼 클릭 시 대피 요령 말풍선 출력
   const handleSelectGuide = (title) => {
      const guideText = fireGuides[title];
      const newMessage = {
         id: Date.now(),
         sender: "bot",
         text: guideText,
      };
      setMessages((prev) => [...prev, newMessage]);
   };

   // 사용자 자유 입력 + GPT 응답
   const sendMessage = async () => {
      if (!input.trim()) return;

      const newMessage = { id: Date.now(), sender: "user", text: input };
      setMessages((prev) => [...prev, newMessage]);
      setInput("");

      try {
         const res = await axios.post(`${apiUrl}/chat`, {
            question: input,
         });

         const botMessage = {
            id: Date.now() + 1,
            sender: "bot",
            text: res.data.answer,
         };

         setMessages((prev) => [...prev, botMessage]);
      } catch (error) {
         console.error("GPT 응답 실패", error);
         setMessages((prev) => [
            ...prev,
            {
               id: Date.now() + 2,
               sender: "bot",
               text: "⚠️ 답변을 가져오지 못했습니다. 다시 시도해주세요.",
            },
         ]);
      }
   };

   return (
      <div className="flex flex-col h-screen max-w-xl mx-auto border rounded shadow-md bg-white">
         <ChatHeader onBack={() => navigate(-1)} />

         {/* 메시지 영역 */}
         <ChatMessageList messages={messages} endRef={messagesEndRef} />

         {/* 대피요령 선택 버튼 */}
         <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
            <p className="mb-2 text-sm font-medium text-gray-700">
               대피 상황 선택:
            </p>
            <div className="flex flex-wrap gap-2">
               {Object.keys(fireGuides).map((title) => (
                  <button
                     key={title}
                     onClick={() => handleSelectGuide(title)}
                     className="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-full"
                  >
                     {title}
                  </button>
               ))}
            </div>
         </div>

         {/* 입력창 */}
         <ChatInputBox input={input} setInput={setInput} onSend={sendMessage} />
      </div>
   );
}

export default ChatBotPage;
