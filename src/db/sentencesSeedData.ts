import type { SeedCard } from './seedData'

// 100 everyday Vietnamese sentences — Front: Vietnamese, Back: English
export const SENTENCES_SEED_CARDS: SeedCard[] = [
  // Greetings & introductions
  { front: 'Xin chào, bạn khỏe không?', back: 'Hello, how are you?' },
  { front: 'Tôi khỏe, cảm ơn bạn.', back: 'I\'m fine, thank you.' },
  { front: 'Tên tôi là Nam.', back: 'My name is Nam.' },
  { front: 'Bạn tên là gì?', back: 'What is your name?' },
  { front: 'Rất vui được gặp bạn.', back: 'Nice to meet you.' },
  { front: 'Lâu rồi không gặp.', back: 'Long time no see.' },
  { front: 'Hẹn gặp lại nhé.', back: 'See you again.' },
  { front: 'Chúc bạn một ngày tốt lành.', back: 'Have a nice day.' },
  { front: 'Tạm biệt, đi nhé.', back: 'Goodbye, take care.' },
  { front: 'Bạn từ đâu đến?', back: 'Where are you from?' },

  // Polite expressions
  { front: 'Cảm ơn bạn rất nhiều.', back: 'Thank you very much.' },
  { front: 'Không có gì.', back: 'You\'re welcome. / It\'s nothing.' },
  { front: 'Xin lỗi, tôi đến muộn.', back: 'Sorry, I\'m late.' },
  { front: 'Làm ơn giúp tôi với.', back: 'Please help me.' },
  { front: 'Xin phép cho tôi hỏi.', back: 'Excuse me, may I ask something?' },

  // Daily routines
  { front: 'Tôi thức dậy lúc sáu giờ sáng.', back: 'I wake up at six in the morning.' },
  { front: 'Bạn ăn sáng chưa?', back: 'Have you had breakfast yet?' },
  { front: 'Tôi đi làm bằng xe máy.', back: 'I go to work by motorbike.' },
  { front: 'Hôm nay tôi bận lắm.', back: 'I\'m very busy today.' },
  { front: 'Tối nay tôi muốn nghỉ ngơi.', back: 'I want to rest tonight.' },
  { front: 'Tôi thường đi ngủ lúc mười giờ.', back: 'I usually go to sleep at ten o\'clock.' },
  { front: 'Mỗi sáng tôi đều tập thể dục.', back: 'I exercise every morning.' },

  // Food & drink
  { front: 'Bạn muốn ăn gì?', back: 'What do you want to eat?' },
  { front: 'Cho tôi một ly cà phê sữa đá.', back: 'Give me an iced milk coffee, please.' },
  { front: 'Món này ngon lắm.', back: 'This dish is very delicious.' },
  { front: 'Tôi không ăn cay được.', back: 'I can\'t eat spicy food.' },
  { front: 'Tính tiền giúp tôi.', back: 'Please bring the bill.' },
  { front: 'Bạn thích ăn phở hay cơm?', back: 'Do you prefer pho or rice?' },
  { front: 'Tôi muốn gọi thêm một món.', back: 'I\'d like to order one more dish.' },
  { front: 'Nước này ngọt quá.', back: 'This drink is too sweet.' },
  { front: 'Ở đây có món chay không?', back: 'Do you have vegetarian dishes here?' },

  // Shopping & prices
  { front: 'Cái này bao nhiêu tiền?', back: 'How much does this cost?' },
  { front: 'Đắt quá, bớt được không?', back: 'That\'s too expensive, can you lower the price?' },
  { front: 'Tôi muốn mua cái áo này.', back: 'I want to buy this shirt.' },
  { front: 'Có size lớn hơn không?', back: 'Do you have a bigger size?' },
  { front: 'Tôi chỉ xem thôi, cảm ơn.', back: 'I\'m just looking, thanks.' },
  { front: 'Bạn có trả bằng thẻ được không?', back: 'Can you pay by card?' },

  // Directions & transportation
  { front: 'Xin lỗi, bưu điện ở đâu?', back: 'Excuse me, where is the post office?' },
  { front: 'Đi thẳng rồi rẽ trái.', back: 'Go straight then turn left.' },
  { front: 'Từ đây đến đó bao xa?', back: 'How far is it from here to there?' },
  { front: 'Bạn có thể chỉ đường cho tôi không?', back: 'Can you show me the way?' },
  { front: 'Tôi muốn đi sân bay.', back: 'I want to go to the airport.' },
  { front: 'Xe buýt số mấy đi trung tâm?', back: 'Which bus goes to the center?' },
  { front: 'Trạm xe buýt gần nhất ở đâu?', back: 'Where is the nearest bus stop?' },

  // Weather & time
  { front: 'Hôm nay trời nóng quá.', back: 'It\'s so hot today.' },
  { front: 'Trời sắp mưa rồi.', back: 'It\'s about to rain.' },
  { front: 'Bây giờ là mấy giờ?', back: 'What time is it now?' },
  { front: 'Mùa này thời tiết đẹp lắm.', back: 'The weather is very nice this season.' },
  { front: 'Hôm qua trời lạnh hơn hôm nay.', back: 'Yesterday was colder than today.' },

  // Feelings & opinions
  { front: 'Tôi rất vui hôm nay.', back: 'I\'m very happy today.' },
  { front: 'Tôi hơi mệt.', back: 'I\'m a bit tired.' },
  { front: 'Tôi đồng ý với bạn.', back: 'I agree with you.' },
  { front: 'Tôi không chắc lắm.', back: 'I\'m not sure.' },
  { front: 'Tôi nghĩ đây là ý hay.', back: 'I think this is a good idea.' },
  { front: 'Tôi lo lắng về chuyện đó.', back: 'I\'m worried about that.' },
  { front: 'Điều đó làm tôi ngạc nhiên.', back: 'That surprises me.' },

  // Family & relationships
  { front: 'Gia đình bạn có mấy người?', back: 'How many people are in your family?' },
  { front: 'Bố mẹ tôi sống ở Hà Nội.', back: 'My parents live in Hanoi.' },
  { front: 'Anh chị em bạn làm gì?', back: 'What do your siblings do?' },
  { front: 'Bạn có con chưa?', back: 'Do you have children yet?' },
  { front: 'Chồng tôi đang đi công tác.', back: 'My husband is on a business trip.' },

  // Work & school
  { front: 'Bạn làm nghề gì?', back: 'What do you do for a living?' },
  { front: 'Tôi làm việc ở công ty phần mềm.', back: 'I work at a software company.' },
  { front: 'Cuộc họp bắt đầu lúc mấy giờ?', back: 'What time does the meeting start?' },
  { front: 'Tôi cần nộp báo cáo trước thứ sáu.', back: 'I need to submit the report before Friday.' },
  { front: 'Bạn đang học tiếng Việt à?', back: 'Are you studying Vietnamese?' },
  { front: 'Tôi muốn xin nghỉ phép ngày mai.', back: 'I want to take a day off tomorrow.' },
  { front: 'Dự án này khi nào hoàn thành?', back: 'When will this project be completed?' },

  // Health
  { front: 'Tôi bị đau đầu.', back: 'I have a headache.' },
  { front: 'Bạn nên đi khám bác sĩ.', back: 'You should see a doctor.' },
  { front: 'Tôi bị dị ứng với hải sản.', back: 'I\'m allergic to seafood.' },
  { front: 'Uống nhiều nước vào nhé.', back: 'Drink plenty of water.' },
  { front: 'Tôi cần mua thuốc.', back: 'I need to buy medicine.' },

  // Making plans
  { front: 'Cuối tuần này bạn có rảnh không?', back: 'Are you free this weekend?' },
  { front: 'Mình đi xem phim nhé?', back: 'Shall we go watch a movie?' },
  { front: 'Gặp nhau ở đâu?', back: 'Where shall we meet?' },
  { front: 'Tôi sẽ đến đúng giờ.', back: 'I\'ll be there on time.' },
  { front: 'Hẹn bạn lúc bảy giờ tối.', back: 'Let\'s meet at seven in the evening.' },
  { front: 'Chúng ta đi đâu bây giờ?', back: 'Where shall we go now?' },
  { front: 'Tôi muốn đổi lịch sang tuần sau.', back: 'I want to reschedule to next week.' },

  // Communication
  { front: 'Bạn nói chậm hơn được không?', back: 'Can you speak more slowly?' },
  { front: 'Tôi không hiểu.', back: 'I don\'t understand.' },
  { front: 'Xin nói lại lần nữa.', back: 'Please say that again.' },
  { front: 'Từ này nghĩa là gì?', back: 'What does this word mean?' },
  { front: 'Bạn có nói tiếng Anh không?', back: 'Do you speak English?' },
  { front: 'Tôi đang học nói tiếng Việt.', back: 'I\'m learning to speak Vietnamese.' },

  // Home & living
  { front: 'Bạn sống ở đâu?', back: 'Where do you live?' },
  { front: 'Nhà tôi gần chợ.', back: 'My house is near the market.' },
  { front: 'Phòng này rộng và thoáng.', back: 'This room is spacious and airy.' },
  { front: 'Tiền thuê nhà bao nhiêu một tháng?', back: 'How much is the rent per month?' },
  { front: 'Tôi cần dọn dẹp nhà cửa.', back: 'I need to clean the house.' },

  // Technology
  { front: 'Mật khẩu wifi là gì?', back: 'What is the wifi password?' },
  { front: 'Điện thoại tôi hết pin rồi.', back: 'My phone is out of battery.' },
  { front: 'Bạn gửi tin nhắn cho tôi nhé.', back: 'Send me a message, please.' },
  { front: 'Tôi không vào mạng được.', back: 'I can\'t connect to the internet.' },

  // Emergencies & problems
  { front: 'Tôi bị lạc đường.', back: 'I\'m lost.' },
  { front: 'Gọi cấp cứu giúp tôi!', back: 'Call an ambulance for me!' },
  { front: 'Tôi bị mất ví.', back: 'I lost my wallet.' },
  { front: 'Có chuyện gì vậy?', back: 'What happened? / What\'s going on?' },
  { front: 'Đừng lo, không sao đâu.', back: 'Don\'t worry, it\'s okay.' },
]
