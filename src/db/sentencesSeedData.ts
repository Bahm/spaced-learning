import type { SeedCard } from './seedData'

// 100 everyday Vietnamese sentences — Front: Vietnamese, Back: English
export const SENTENCES_SEED_CARDS: SeedCard[] = [
  // Greetings & introductions
  { front: 'Xin chào, bạn khỏe không?', back: 'Hello, how are you?', explanation: '"Khỏe không?" literally means "healthy or not?" — the standard Vietnamese greeting.' },
  { front: 'Tôi khỏe, cảm ơn bạn.', back: 'I\'m fine, thank you.', explanation: '"Cảm ơn" is "thank you". Add "bạn" (you) to direct it at someone specific.' },
  { front: 'Tên tôi là Nam.', back: 'My name is Nam.', explanation: '"Tên" = name, "là" = is. Pattern: Tên + [pronoun] + là + [name].' },
  { front: 'Bạn tên là gì?', back: 'What is your name?', explanation: '"Gì" = what. Place it at the end to form a question.' },
  { front: 'Rất vui được gặp bạn.', back: 'Nice to meet you.', explanation: '"Rất" = very, "vui" = happy, "được gặp" = to be able to meet.' },
  { front: 'Lâu rồi không gặp.', back: 'Long time no see.', explanation: '"Lâu" = long (time), "rồi" = already, "không gặp" = not met.' },
  { front: 'Hẹn gặp lại nhé.', back: 'See you again.', explanation: '"Nhé" is a soft particle that makes the sentence friendly and informal.' },
  { front: 'Chúc bạn một ngày tốt lành.', back: 'Have a nice day.', explanation: '"Chúc" = to wish. "Tốt lành" = good/pleasant.' },
  { front: 'Tạm biệt, đi nhé.', back: 'Goodbye, take care.', explanation: '"Tạm biệt" is formal goodbye. "Đi nhé" literally "go, okay?" is a casual send-off.' },
  { front: 'Bạn từ đâu đến?', back: 'Where are you from?', explanation: '"Từ" = from, "đâu" = where, "đến" = come. Literally "from where come?"' },

  // Polite expressions
  { front: 'Cảm ơn bạn rất nhiều.', back: 'Thank you very much.', explanation: '"Rất nhiều" = very much. Adds emphasis to "cảm ơn" (thank you).' },
  { front: 'Không có gì.', back: 'You\'re welcome. / It\'s nothing.', explanation: 'Literally "not have anything" — the most common response to thanks.' },
  { front: 'Xin lỗi, tôi đến muộn.', back: 'Sorry, I\'m late.', explanation: '"Xin lỗi" = sorry/excuse me. "Muộn" = late.' },
  { front: 'Làm ơn giúp tôi với.', back: 'Please help me.', explanation: '"Làm ơn" = please (formal). "Với" at the end adds urgency/politeness.' },
  { front: 'Xin phép cho tôi hỏi.', back: 'Excuse me, may I ask something?', explanation: '"Xin phép" = to ask permission. Very polite way to start a question.' },

  // Daily routines
  { front: 'Tôi thức dậy lúc sáu giờ sáng.', back: 'I wake up at six in the morning.', explanation: '"Lúc" = at (time). Time pattern: lúc + [number] + giờ + [sáng/chiều/tối].' },
  { front: 'Bạn ăn sáng chưa?', back: 'Have you had breakfast yet?', explanation: '"Chưa" = yet/not yet. Used to ask about completed actions. Answer: "Rồi" (already) or "Chưa" (not yet).' },
  { front: 'Tôi đi làm bằng xe máy.', back: 'I go to work by motorbike.', explanation: '"Bằng" = by (means of transport). "Xe máy" = motorbike, the most common transport in Vietnam.' },
  { front: 'Hôm nay tôi bận lắm.', back: 'I\'m very busy today.', explanation: '"Lắm" = very/so much (placed after adjective, colloquial). Similar to "rất" but more casual.' },
  { front: 'Tối nay tôi muốn nghỉ ngơi.', back: 'I want to rest tonight.', explanation: '"Tối nay" = tonight. "Nghỉ ngơi" is a reduplicative form meaning "to rest/relax".' },
  { front: 'Tôi thường đi ngủ lúc mười giờ.', back: 'I usually go to sleep at ten o\'clock.', explanation: '"Thường" = usually/often. Placed before the verb.' },
  { front: 'Mỗi sáng tôi đều tập thể dục.', back: 'I exercise every morning.', explanation: '"Mỗi" = every/each. "Đều" = all/consistently — emphasizes regularity.' },

  // Food & drink
  { front: 'Bạn muốn ăn gì?', back: 'What do you want to eat?', explanation: '"Muốn" = want. "Gì" at the end makes it a question word (what).' },
  { front: 'Cho tôi một ly cà phê sữa đá.', back: 'Give me an iced milk coffee, please.', explanation: '"Cho tôi" = give me (polite ordering pattern). "Ly" = glass. "Cà phê sữa đá" = Vietnam\'s iconic iced milk coffee.' },
  { front: 'Món này ngon lắm.', back: 'This dish is very delicious.', explanation: '"Món" = dish/course. "Ngon" = delicious. "Lắm" intensifies the adjective.' },
  { front: 'Tôi không ăn cay được.', back: 'I can\'t eat spicy food.', explanation: '"Được" at the end = can/able to. "Không ... được" = cannot.' },
  { front: 'Tính tiền giúp tôi.', back: 'Please bring the bill.', explanation: '"Tính tiền" = calculate money. "Giúp" = help — softens the request.' },
  { front: 'Bạn thích ăn phở hay cơm?', back: 'Do you prefer pho or rice?', explanation: '"Hay" = or (in questions). "Thích" = to like/prefer.' },
  { front: 'Tôi muốn gọi thêm một món.', back: 'I\'d like to order one more dish.', explanation: '"Gọi" = to call/order. "Thêm" = more/additional.' },
  { front: 'Nước này ngọt quá.', back: 'This drink is too sweet.', explanation: '"Quá" after an adjective = too (excessive). "Ngọt" = sweet.' },
  { front: 'Ở đây có món chay không?', back: 'Do you have vegetarian dishes here?', explanation: '"Có ... không?" is the yes/no question pattern. "Chay" = vegetarian (from Buddhist tradition).' },

  // Shopping & prices
  { front: 'Cái này bao nhiêu tiền?', back: 'How much does this cost?', explanation: '"Bao nhiêu" = how much/many. "Tiền" = money. Essential market phrase.' },
  { front: 'Đắt quá, bớt được không?', back: 'That\'s too expensive, can you lower the price?', explanation: '"Bớt" = to reduce/discount. Bargaining is expected at Vietnamese markets.' },
  { front: 'Tôi muốn mua cái áo này.', back: 'I want to buy this shirt.', explanation: '"Cái" is a general classifier for objects. "Áo" = shirt/top.' },
  { front: 'Có size lớn hơn không?', back: 'Do you have a bigger size?', explanation: '"Hơn" after adjective = comparative (-er). "Lớn hơn" = bigger.' },
  { front: 'Tôi chỉ xem thôi, cảm ơn.', back: 'I\'m just looking, thanks.', explanation: '"Chỉ ... thôi" = just/only. Useful for browsing without pressure.' },
  { front: 'Bạn có trả bằng thẻ được không?', back: 'Can you pay by card?', explanation: '"Thẻ" = card. Cash is still king in many Vietnamese shops.' },

  // Directions & transportation
  { front: 'Xin lỗi, bưu điện ở đâu?', back: 'Excuse me, where is the post office?', explanation: '"Ở đâu" = where (location). "Bưu điện" = post office. Pattern: [place] + ở đâu?' },
  { front: 'Đi thẳng rồi rẽ trái.', back: 'Go straight then turn left.', explanation: '"Thẳng" = straight, "rẽ" = turn, "trái" = left ("phải" = right). "Rồi" connects sequential actions.' },
  { front: 'Từ đây đến đó bao xa?', back: 'How far is it from here to there?', explanation: '"Bao xa" = how far. "Từ ... đến" = from ... to. "Đây" = here, "đó" = there.' },
  { front: 'Bạn có thể chỉ đường cho tôi không?', back: 'Can you show me the way?', explanation: '"Có thể" = can/be able to. "Chỉ đường" = show the way/give directions.' },
  { front: 'Tôi muốn đi sân bay.', back: 'I want to go to the airport.', explanation: '"Sân bay" = airport (literally "flight yard"). No preposition needed after "đi" for destinations.' },
  { front: 'Xe buýt số mấy đi trung tâm?', back: 'Which bus goes to the center?', explanation: '"Số mấy" = which number. "Trung tâm" = center/downtown. "Xe buýt" = bus (loanword).' },
  { front: 'Trạm xe buýt gần nhất ở đâu?', back: 'Where is the nearest bus stop?', explanation: '"Gần nhất" = nearest (superlative: adjective + "nhất"). "Trạm" = station/stop.' },

  // Weather & time
  { front: 'Hôm nay trời nóng quá.', back: 'It\'s so hot today.', explanation: '"Trời" = sky/weather, used as the subject for weather statements. "Nóng" = hot, "quá" = too/so.' },
  { front: 'Trời sắp mưa rồi.', back: 'It\'s about to rain.', explanation: '"Sắp" = about to/soon (imminent future marker). "Mưa" = rain. "Rồi" adds certainty.' },
  { front: 'Bây giờ là mấy giờ?', back: 'What time is it now?', explanation: '"Bây giờ" = now. "Mấy giờ" = what time (literally "how many hours").' },
  { front: 'Mùa này thời tiết đẹp lắm.', back: 'The weather is very nice this season.', explanation: '"Mùa" = season. "Thời tiết" = weather (formal). "Đẹp" = beautiful/nice.' },
  { front: 'Hôm qua trời lạnh hơn hôm nay.', back: 'Yesterday was colder than today.', explanation: '"Hôm qua" = yesterday. "Lạnh hơn" = colder (comparative with "hơn"). Vietnamese has no verb tense changes.' },

  // Feelings & opinions
  { front: 'Tôi rất vui hôm nay.', back: 'I\'m very happy today.', explanation: '"Rất" = very (placed before adjective). "Vui" = happy/glad.' },
  { front: 'Tôi hơi mệt.', back: 'I\'m a bit tired.', explanation: '"Hơi" = a bit/slightly (softer than "rất"). "Mệt" = tired.' },
  { front: 'Tôi đồng ý với bạn.', back: 'I agree with you.', explanation: '"Đồng ý" = to agree (Sino-Vietnamese: 同意). "Với" = with.' },
  { front: 'Tôi không chắc lắm.', back: 'I\'m not sure.', explanation: '"Chắc" = sure/certain. "Không ... lắm" = not very/not really.' },
  { front: 'Tôi nghĩ đây là ý hay.', back: 'I think this is a good idea.', explanation: '"Nghĩ" = to think. "Ý" = idea. "Hay" = good/interesting (for ideas, stories, movies).' },
  { front: 'Tôi lo lắng về chuyện đó.', back: 'I\'m worried about that.', explanation: '"Lo lắng" = worried/anxious. "Về" = about. "Chuyện" = matter/story.' },
  { front: 'Điều đó làm tôi ngạc nhiên.', back: 'That surprises me.', explanation: '"Điều đó" = that (abstract thing). "Làm" = to make. "Ngạc nhiên" = surprised.' },

  // Family & relationships
  { front: 'Gia đình bạn có mấy người?', back: 'How many people are in your family?', explanation: '"Gia đình" = family. "Mấy" = how many (expects a small number). "Người" = person/people.' },
  { front: 'Bố mẹ tôi sống ở Hà Nội.', back: 'My parents live in Hanoi.', explanation: '"Bố mẹ" = parents (Northern). Southern Vietnamese uses "ba má". "Sống" = to live.' },
  { front: 'Anh chị em bạn làm gì?', back: 'What do your siblings do?', explanation: '"Anh chị em" = siblings (older brother + older sister + younger sibling). "Làm gì" = do what.' },
  { front: 'Bạn có con chưa?', back: 'Do you have children yet?', explanation: '"Có ... chưa?" asks if something has happened yet. "Con" = child/children. A common question in Vietnamese culture.' },
  { front: 'Chồng tôi đang đi công tác.', back: 'My husband is on a business trip.', explanation: '"Chồng" = husband ("vợ" = wife). "Đi công tác" = go on a business trip.' },

  // Work & school
  { front: 'Bạn làm nghề gì?', back: 'What do you do for a living?', explanation: '"Nghề" = profession/occupation. "Làm nghề gì" is the standard way to ask about someone\'s job.' },
  { front: 'Tôi làm việc ở công ty phần mềm.', back: 'I work at a software company.', explanation: '"Làm việc" = to work. "Công ty" = company. "Phần mềm" = software (literally "soft part").' },
  { front: 'Cuộc họp bắt đầu lúc mấy giờ?', back: 'What time does the meeting start?', explanation: '"Cuộc họp" = meeting ("cuộc" is a classifier for events). "Bắt đầu" = to begin/start.' },
  { front: 'Tôi cần nộp báo cáo trước thứ sáu.', back: 'I need to submit the report before Friday.', explanation: '"Nộp" = to submit. "Báo cáo" = report. "Trước" = before. Days: thứ hai (Mon) through chủ nhật (Sun).' },
  { front: 'Bạn đang học tiếng Việt à?', back: 'Are you studying Vietnamese?', explanation: '"À" at the end is a question particle expressing mild surprise or seeking confirmation.' },
  { front: 'Tôi muốn xin nghỉ phép ngày mai.', back: 'I want to take a day off tomorrow.', explanation: '"Xin nghỉ phép" = to request leave. "Ngày mai" = tomorrow.' },
  { front: 'Dự án này khi nào hoàn thành?', back: 'When will this project be completed?', explanation: '"Dự án" = project. "Khi nào" = when. "Hoàn thành" = to complete/finish.' },

  // Health
  { front: 'Tôi bị đau đầu.', back: 'I have a headache.', explanation: '"Bị" marks an unpleasant experience. "Đau" = pain, "đầu" = head. Pattern: bị + đau + [body part].' },
  { front: 'Bạn nên đi khám bác sĩ.', back: 'You should see a doctor.', explanation: '"Nên" = should. "Khám" = to examine/check up. "Bác sĩ" = doctor.' },
  { front: 'Tôi bị dị ứng với hải sản.', back: 'I\'m allergic to seafood.', explanation: '"Dị ứng" = allergic. "Hải sản" = seafood (literally "sea products"). Important phrase for dining out.' },
  { front: 'Uống nhiều nước vào nhé.', back: 'Drink plenty of water.', explanation: '"Uống" = to drink. "Vào" adds direction (into the body). "Nhé" softens it to friendly advice.' },
  { front: 'Tôi cần mua thuốc.', back: 'I need to buy medicine.', explanation: '"Thuốc" = medicine/drug. In Vietnam, many medications are available over the counter at "nhà thuốc" (pharmacy).' },

  // Making plans
  { front: 'Cuối tuần này bạn có rảnh không?', back: 'Are you free this weekend?', explanation: '"Cuối tuần" = weekend. "Rảnh" = free/available. "Có ... không?" is the yes/no question pattern.' },
  { front: 'Mình đi xem phim nhé?', back: 'Shall we go watch a movie?', explanation: '"Mình" = we/us (informal). "Xem phim" = watch a movie. "Nhé" makes it a gentle suggestion.' },
  { front: 'Gặp nhau ở đâu?', back: 'Where shall we meet?', explanation: '"Gặp nhau" = meet each other ("nhau" = each other/one another). "Ở đâu" = where.' },
  { front: 'Tôi sẽ đến đúng giờ.', back: 'I\'ll be there on time.', explanation: '"Sẽ" = will (future marker). "Đúng giờ" = on time (literally "correct hour").' },
  { front: 'Hẹn bạn lúc bảy giờ tối.', back: 'Let\'s meet at seven in the evening.', explanation: '"Hẹn" = to arrange to meet/make an appointment. "Tối" = evening (after 6pm).' },
  { front: 'Chúng ta đi đâu bây giờ?', back: 'Where shall we go now?', explanation: '"Chúng ta" = we (inclusive, formal). "Đi đâu" = go where. "Bây giờ" = now.' },
  { front: 'Tôi muốn đổi lịch sang tuần sau.', back: 'I want to reschedule to next week.', explanation: '"Đổi lịch" = reschedule (change schedule). "Sang" = to/over to. "Tuần sau" = next week.' },

  // Communication
  { front: 'Bạn nói chậm hơn được không?', back: 'Can you speak more slowly?', explanation: '"Chậm hơn" = slower (comparative). Essential phrase for language learners!' },
  { front: 'Tôi không hiểu.', back: 'I don\'t understand.', explanation: '"Hiểu" = to understand. "Không" before verb = negation.' },
  { front: 'Xin nói lại lần nữa.', back: 'Please say that again.', explanation: '"Lại" = again. "Lần nữa" = one more time. Double emphasis on repetition.' },
  { front: 'Từ này nghĩa là gì?', back: 'What does this word mean?', explanation: '"Từ" = word. "Nghĩa" = meaning. Very useful when reading Vietnamese.' },
  { front: 'Bạn có nói tiếng Anh không?', back: 'Do you speak English?', explanation: '"Tiếng" = language/sound. "Tiếng Anh" = English, "tiếng Việt" = Vietnamese.' },
  { front: 'Tôi đang học nói tiếng Việt.', back: 'I\'m learning to speak Vietnamese.', explanation: '"Đang" = currently (progressive tense marker). "Học" = to study/learn.' },

  // Home & living
  { front: 'Bạn sống ở đâu?', back: 'Where do you live?', explanation: '"Sống" = to live. "Ở đâu" = where. Can also use "ở" alone to mean "live at" a specific place.' },
  { front: 'Nhà tôi gần chợ.', back: 'My house is near the market.', explanation: '"Nhà" = house/home. "Gần" = near. "Chợ" = market — traditional markets are central to Vietnamese life.' },
  { front: 'Phòng này rộng và thoáng.', back: 'This room is spacious and airy.', explanation: '"Phòng" = room. "Rộng" = spacious/wide. "Thoáng" = airy/ventilated — highly valued in tropical Vietnam.' },
  { front: 'Tiền thuê nhà bao nhiêu một tháng?', back: 'How much is the rent per month?', explanation: '"Tiền thuê" = rent money. "Một tháng" = per month. "Bao nhiêu" = how much.' },
  { front: 'Tôi cần dọn dẹp nhà cửa.', back: 'I need to clean the house.', explanation: '"Dọn dẹp" = to clean/tidy up. "Nhà cửa" = house (emphatic reduplicative: nhà = house, cửa = door).' },

  // Technology
  { front: 'Mật khẩu wifi là gì?', back: 'What is the wifi password?', explanation: '"Mật khẩu" = password (literally "secret code"). Essential phrase for cafes and hotels.' },
  { front: 'Điện thoại tôi hết pin rồi.', back: 'My phone is out of battery.', explanation: '"Điện thoại" = phone (literally "electric speech"). "Hết" = out of/finished. "Pin" = battery.' },
  { front: 'Bạn gửi tin nhắn cho tôi nhé.', back: 'Send me a message, please.', explanation: '"Gửi" = to send. "Tin nhắn" = message. "Cho tôi" = to/for me.' },
  { front: 'Tôi không vào mạng được.', back: 'I can\'t connect to the internet.', explanation: '"Vào mạng" = get online (literally "enter the network"). "Không ... được" = cannot.' },

  // Emergencies & problems
  { front: 'Tôi bị lạc đường.', back: 'I\'m lost.', explanation: '"Bị" marks an unfortunate situation. "Lạc đường" = lost the way. "Lạc" = lost/astray.' },
  { front: 'Gọi cấp cứu giúp tôi!', back: 'Call an ambulance for me!', explanation: '"Cấp cứu" = emergency/ambulance. "Gọi ... giúp tôi" = call ... for me. Emergency number in Vietnam is 115.' },
  { front: 'Tôi bị mất ví.', back: 'I lost my wallet.', explanation: '"Mất" = to lose. "Ví" = wallet. "Bị mất" = lost (unpleasant experience).' },
  { front: 'Có chuyện gì vậy?', back: 'What happened? / What\'s going on?', explanation: '"Có chuyện gì" = what matter is there. "Vậy" = so/then — adds a sense of concern or curiosity.' },
  { front: 'Đừng lo, không sao đâu.', back: 'Don\'t worry, it\'s okay.', explanation: '"Đừng" = don\'t (negative imperative). "Không sao" = it\'s fine/no problem. "Đâu" softens the reassurance.' },
]
