import type { SeedCard } from './seedData'

// 150 Vietnamese food & dining cards — Front: Vietnamese, Back: English
export const FOOD_SEED_CARDS: SeedCard[] = [
  // ── Iconic dishes ───────────────────────────────────────────────────────────
  { front: 'phở bò', back: 'beef pho (rice noodle soup)', explanation: 'Vietnam\'s national dish. "Phở" is the rice noodle soup; "bò" means beef. Pronounced roughly "fuh baw."' },
  { front: 'phở gà', back: 'chicken pho', explanation: '"Gà" = chicken. A lighter alternative to phở bò, popular for breakfast.' },
  { front: 'bún chả', back: 'grilled pork with rice vermicelli', explanation: 'A Hanoi specialty. "Bún" = rice vermicelli, "chả" = grilled meat patty. Served with herbs and dipping sauce.' },
  { front: 'bánh mì', back: 'Vietnamese baguette sandwich', explanation: 'A fusion of French and Vietnamese cuisine. "Bánh" = cake/bread, "mì" = wheat. Filled with pâté, meats, pickled vegetables, and herbs.' },
  { front: 'cơm tấm', back: 'broken rice', explanation: 'A Saigon street food staple. "Cơm" = rice, "tấm" = broken/fractured. Served with grilled pork chop, egg, and fish sauce.' },
  { front: 'bún bò Huế', back: 'Hue-style spicy beef noodle soup', explanation: 'A central Vietnamese specialty from Huế. Features a spicy, lemongrass-flavored broth with thick round noodles.' },
  { front: 'bánh xèo', back: 'Vietnamese crispy crepe', explanation: '"Xèo" is the sizzling sound the batter makes. A turmeric-tinted rice flour crepe filled with shrimp, pork, and bean sprouts.' },
  { front: 'gỏi cuốn', back: 'fresh spring rolls', explanation: '"Gỏi" = salad, "cuốn" = rolled. Rice paper rolls filled with shrimp, herbs, pork, and vermicelli. Served with peanut sauce.' },
  { front: 'chả giò', back: 'fried spring rolls', explanation: 'Southern term for crispy fried rolls. In the north, they are called "nem rán." Filled with pork, mushrooms, and glass noodles.' },
  { front: 'cao lầu', back: 'Hoi An noodle dish', explanation: 'A specialty exclusive to Hội An. Thick noodles in a small amount of broth with pork, herbs, and crispy croutons.' },

  // ── Soups & noodles ─────────────────────────────────────────────────────────
  { front: 'mì quảng', back: 'Quang-style turmeric noodles', explanation: 'From Quảng Nam province. Wide rice noodles in a small amount of turmeric-tinted broth with shrimp, pork, and peanuts.' },
  { front: 'hủ tiếu', back: 'clear rice noodle soup (Southern style)', explanation: 'A Saigon breakfast staple with Chinese-Vietnamese origins. Can be served with broth ("nước") or dry ("khô").' },
  { front: 'bún riêu', back: 'crab tomato noodle soup', explanation: '"Riêu" refers to the crab paste. A tangy soup with tomato broth, crab meatballs, tofu, and rice vermicelli.' },
  { front: 'miến gà', back: 'chicken glass noodle soup', explanation: '"Miến" = glass/cellophane noodles (made from mung bean starch). A light, comforting soup.' },
  { front: 'cháo gà', back: 'chicken rice porridge', explanation: '"Cháo" = congee/porridge. A comfort food eaten when sick or for breakfast. Topped with shredded chicken and fried shallots.' },
  { front: 'canh chua', back: 'sour soup', explanation: '"Canh" = soup, "chua" = sour. A tamarind-based soup with fish, tomatoes, pineapple, and bean sprouts. A southern staple.' },
  { front: 'lẩu', back: 'hot pot', explanation: 'Vietnamese-style hot pot, popular for group dining. Common varieties include seafood (hải sản), goat (dê), and mushroom (nấm).' },
  { front: 'súp cua', back: 'crab soup', explanation: 'A thick, savory soup made with crab meat, egg, and corn starch. Popular street snack, often sold from mobile carts.' },
  { front: 'bún mắm', back: 'fermented fish noodle soup', explanation: '"Mắm" = fermented fish paste. A pungent, savory southern Vietnamese soup with seafood and vegetables over vermicelli.' },
  { front: 'phở cuốn', back: 'rolled pho noodle sheets', explanation: 'Pho noodle sheets rolled around grilled beef and herbs. An appetizer variation of phở, popular in Hanoi.' },

  // ── Rice dishes ─────────────────────────────────────────────────────────────
  { front: 'cơm gà', back: 'chicken rice', explanation: '"Cơm" = cooked rice, "gà" = chicken. Rice cooked in chicken broth, served with poached or roasted chicken.' },
  { front: 'cơm sườn', back: 'rice with grilled pork chop', explanation: '"Sườn" = ribs/chop. A common lunch plate with a marinated grilled pork chop over steamed rice.' },
  { front: 'cơm chiên', back: 'fried rice', explanation: '"Chiên" = fried. Vietnamese fried rice, typically with egg, vegetables, and choice of protein.' },
  { front: 'cơm rang', back: 'stir-fried rice', explanation: '"Rang" = stir-fry/roast. Northern term for fried rice. "Cơm chiên" is more common in the south.' },
  { front: 'xôi', back: 'sticky rice', explanation: 'Glutinous rice, a popular breakfast food. Comes in many varieties: xôi gấc (red), xôi đậu (bean), xôi xéo (mung bean).' },
  { front: 'cơm bình dân', back: 'budget rice eatery', explanation: '"Bình dân" = common/popular. A cafeteria-style restaurant where you point at dishes and they serve them over rice. Very affordable.' },

  // ── Meats & proteins ────────────────────────────────────────────────────────
  { front: 'thịt bò', back: 'beef', explanation: '"Thịt" = meat. "Bò" = cow/cattle. Combined: beef.' },
  { front: 'thịt heo', back: 'pork', explanation: '"Heo" = pig (southern term). Northern Vietnamese uses "lợn" instead: "thịt lợn."' },
  { front: 'thịt gà', back: 'chicken (meat)', explanation: '"Gà" = chicken. "Thịt gà" specifies the meat, as opposed to a live chicken.' },
  { front: 'tôm', back: 'shrimp / prawn', explanation: 'One of the most common proteins in Vietnamese cuisine, especially in southern and coastal dishes.' },
  { front: 'cá', back: 'fish', explanation: 'Fish is central to Vietnamese cuisine. "Cá kho tộ" (caramelized fish in clay pot) is a beloved home-style dish.' },
  { front: 'mực', back: 'squid', explanation: 'Common in seafood dishes. "Mực chiên" = fried squid, "mực nướng" = grilled squid.' },
  { front: 'cua', back: 'crab', explanation: 'Popular in soups, stir-fries, and steamed dishes. "Cua biển" = sea crab, "cua đồng" = field/freshwater crab.' },
  { front: 'vịt', back: 'duck', explanation: 'Used in dishes like "vịt quay" (roast duck) and "cháo vịt" (duck porridge).' },
  { front: 'trứng', back: 'egg', explanation: '"Trứng gà" = chicken egg, "trứng vịt" = duck egg, "trứng vịt lộn" = fertilized duck egg (balut).' },
  { front: 'đậu phụ', back: 'tofu', explanation: '"Đậu" = bean, "phụ" from Chinese "fǔ." Also called "đậu hũ" in the south. Essential in vegetarian Vietnamese food.' },

  // ── Vegetables & herbs ──────────────────────────────────────────────────────
  { front: 'rau muống', back: 'morning glory / water spinach', explanation: 'Vietnam\'s most popular vegetable. Often stir-fried with garlic: "rau muống xào tỏi."' },
  { front: 'giá đỗ', back: 'bean sprouts', explanation: '"Giá" = sprouts, "đỗ" = bean. Essential garnish for phở and many noodle dishes.' },
  { front: 'rau thơm', back: 'fresh herbs', explanation: '"Rau" = vegetable, "thơm" = fragrant. A general term for the herb plate served alongside most Vietnamese meals.' },
  { front: 'húng quế', back: 'Thai basil', explanation: 'An aromatic herb served with phở and many noodle dishes. "Húng" = basil/mint family, "quế" = cinnamon (refers to the flavor note).' },
  { front: 'ngò rí', back: 'cilantro / coriander', explanation: 'Southern term. In the north: "rau mùi." One of the most used herbs in Vietnamese cooking.' },
  { front: 'sả', back: 'lemongrass', explanation: 'Used extensively in Vietnamese cooking for its citrusy fragrance. Key ingredient in bún bò Huế and many stir-fries.' },
  { front: 'ớt', back: 'chili pepper', explanation: 'Vietnamese cuisine uses fresh chilies for heat. "Ớt hiểm" = bird\'s eye chili (very spicy).' },
  { front: 'tỏi', back: 'garlic', explanation: 'Fundamental aromatic in Vietnamese cooking. "Tỏi phi" = fried garlic, a common topping.' },
  { front: 'hành', back: 'onion / scallion', explanation: '"Hành tây" = onion (literally "western onion"), "hành lá" = scallion/green onion.' },
  { front: 'gừng', back: 'ginger', explanation: 'Used in soups, teas, and marinades. "Nước gừng" = ginger water/tea, a common home remedy.' },
  { front: 'rau mùi', back: 'cilantro (northern term)', explanation: 'Northern Vietnamese word for cilantro. Same herb as "ngò rí" (southern). "Mùi" means scent/fragrance.' },
  { front: 'bắp cải', back: 'cabbage', explanation: '"Bắp" = ear/head, "cải" = a category of leafy vegetables. Used in stir-fries, soups, and as wraps.' },

  // ── Fruits ──────────────────────────────────────────────────────────────────
  { front: 'xoài', back: 'mango', explanation: 'Vietnam is a major mango producer. Green mango is used in salads; ripe mango is eaten fresh or in smoothies.' },
  { front: 'thanh long', back: 'dragon fruit', explanation: '"Thanh" = green/blue, "long" = dragon. Vietnam is the world\'s largest dragon fruit exporter.' },
  { front: 'sầu riêng', back: 'durian', explanation: '"Sầu riêng" literally means "private sorrow." Famous for its strong smell. Banned in many hotels but beloved by many Vietnamese.' },
  { front: 'chôm chôm', back: 'rambutan', explanation: 'Named after the Malay word for "hair" — refers to the hairy skin. Sweet and juicy, common in southern Vietnam.' },
  { front: 'măng cụt', back: 'mangosteen', explanation: 'Called "the queen of fruits." Has a thick purple rind with sweet, white segments inside. Seasonal (May–August).' },
  { front: 'bưởi', back: 'pomelo', explanation: 'A large citrus fruit, popular during Tết (Lunar New Year). Sweeter and milder than grapefruit.' },
  { front: 'ổi', back: 'guava', explanation: 'Eaten with chili salt ("muối ớt") as a popular snack. "Ổi" is one of the cheapest and most common fruits in Vietnam.' },
  { front: 'dừa', back: 'coconut', explanation: 'Central to southern Vietnamese cuisine and beverages. "Nước dừa" = coconut water, "cơm dừa" = coconut flesh.' },

  // ── Condiments & sauces ─────────────────────────────────────────────────────
  { front: 'nước mắm', back: 'fish sauce', explanation: 'The cornerstone of Vietnamese cuisine. Made from fermented anchovies and salt. Used in cooking, dipping, and dressings.' },
  { front: 'nước chấm', back: 'dipping sauce', explanation: '"Chấm" = to dip. Usually a mix of fish sauce, lime juice, sugar, garlic, and chili. Accompanies most dishes.' },
  { front: 'tương ớt', back: 'chili sauce', explanation: '"Tương" = sauce/paste. Sriracha-style hot sauce, found on every Vietnamese table.' },
  { front: 'tương đen', back: 'hoisin sauce', explanation: '"Đen" = black/dark. A sweet, thick sauce served with phở (for dipping meat) and bánh cuốn.' },
  { front: 'mắm tôm', back: 'fermented shrimp paste', explanation: 'A pungent condiment essential to bún đậu mắm tôm (fried tofu with shrimp paste). Strong smell, acquired taste.' },
  { front: 'muối tiêu chanh', back: 'salt, pepper, and lime dip', explanation: 'A simple dipping mixture: salt + black pepper + lime juice. Classic accompaniment for grilled meats and seafood.' },
  { front: 'đường', back: 'sugar', explanation: 'Vietnamese cooking balances sweet, salty, sour, and spicy. Sugar is used generously even in savory dishes.' },
  { front: 'muối', back: 'salt', explanation: 'Besides table salt, Vietnamese cuisine features "muối ớt" (chili salt) and "muối tôm" (shrimp salt) for dipping fruit.' },
  { front: 'tiêu', back: 'black pepper', explanation: 'Vietnam is the world\'s largest black pepper exporter. Phú Quốc pepper is especially prized.' },
  { front: 'dấm', back: 'vinegar', explanation: 'Used in pickles, dipping sauces, and to add sourness. "Dấm gạo" = rice vinegar.' },

  // ── Drinks ──────────────────────────────────────────────────────────────────
  { front: 'cà phê sữa đá', back: 'iced coffee with condensed milk', explanation: 'Vietnam\'s signature drink. "Cà phê" = coffee, "sữa" = milk, "đá" = ice. Brewed with a phin (drip filter).' },
  { front: 'cà phê đen', back: 'black coffee', explanation: '"Đen" = black. Strong, bold Vietnamese coffee without milk. "Cà phê đen đá" = iced black coffee.' },
  { front: 'trà đá', back: 'iced tea', explanation: 'Free iced tea served at most restaurants and street food stalls. "Trà" = tea, "đá" = ice.' },
  { front: 'nước mía', back: 'sugarcane juice', explanation: '"Mía" = sugarcane. Freshly pressed sugarcane juice, often with kumquat. A popular street drink.' },
  { front: 'sinh tố', back: 'smoothie / fruit shake', explanation: '"Sinh tố bơ" = avocado smoothie, "sinh tố xoài" = mango smoothie. Blended with ice and condensed milk.' },
  { front: 'nước chanh', back: 'lemonade / lime juice', explanation: '"Chanh" = lime (or lemon). Fresh lime juice with sugar and ice. "Chanh muối" = salted preserved lime drink.' },
  { front: 'bia', back: 'beer', explanation: 'Vietnam has a strong beer culture. Popular brands: Bia Sài Gòn, Bia Hà Nội, 333 (ba ba ba), Tiger.' },
  { front: 'rượu', back: 'wine / liquor / alcohol', explanation: 'General term for alcoholic drinks. "Rượu vang" = wine, "rượu đế" = rice liquor, "rượu rắn" = snake wine.' },
  { front: 'nước dừa tươi', back: 'fresh coconut water', explanation: '"Tươi" = fresh. Served in the coconut shell with a straw. Refreshing and widely available, especially in the south.' },
  { front: 'sữa đậu nành', back: 'soy milk', explanation: '"Đậu nành" = soybean. Fresh soy milk is a popular breakfast drink, often sweetened.' },
  { front: 'trà sữa', back: 'milk tea / bubble tea', explanation: 'Hugely popular among young Vietnamese. "Trà sữa trân châu" = bubble milk tea (with tapioca pearls).' },

  // ── Snacks & street food ────────────────────────────────────────────────────
  { front: 'bánh cuốn', back: 'steamed rice rolls', explanation: 'Delicate sheets of steamed rice batter filled with pork and mushrooms. A Hanoi breakfast classic.' },
  { front: 'bánh bao', back: 'steamed bun', explanation: 'Vietnamese steamed bun filled with pork, egg, and vegetables. From Chinese "bāo" (包).' },
  { front: 'bánh tráng trộn', back: 'mixed rice paper snack', explanation: '"Trộn" = mixed. Shredded rice paper tossed with dried shrimp, mango, quail eggs, herbs, and chili. A Saigon street snack.' },
  { front: 'chè', back: 'sweet dessert soup / pudding', explanation: 'A broad category of Vietnamese sweet soups/puddings. "Chè ba màu" = three-color dessert, "chè chuối" = banana in coconut milk.' },
  { front: 'bánh tráng nướng', back: 'grilled rice paper ("Vietnamese pizza")', explanation: '"Nướng" = grilled. Rice paper topped with egg, scallion, dried shrimp, and chili sauce, grilled over charcoal.' },
  { front: 'bột chiên', back: 'fried rice flour cake', explanation: 'Cubes of rice flour dough fried with egg and served with pickled papaya and chili sauce. A Chinese-Vietnamese street snack.' },
  { front: 'nem chua', back: 'fermented pork roll', explanation: '"Chua" = sour. Pork is fermented with garlic, chili, and rice powder, wrapped in banana leaves. A Thanh Hóa specialty.' },
  { front: 'bánh khọt', back: 'mini savory pancakes', explanation: 'Small, crispy coconut milk pancakes topped with shrimp. A Vũng Tàu specialty, served with lettuce wraps and dipping sauce.' },
  { front: 'ốc', back: 'snails / shellfish', explanation: 'Snail dishes are hugely popular in Vietnam. "Ốc luộc" = boiled snails, "ốc hương" = sweet snails. Often enjoyed with beer.' },
  { front: 'hột vịt lộn', back: 'fertilized duck egg (balut)', explanation: 'A developing duck embryo eaten from the shell. Considered a delicacy and street food snack. Called "trứng vịt lộn" in the north.' },

  // ── Cooking methods ─────────────────────────────────────────────────────────
  { front: 'nướng', back: 'grilled / barbecued', explanation: '"Thịt nướng" = grilled meat. Charcoal grilling is the most common method in Vietnamese BBQ.' },
  { front: 'chiên', back: 'deep-fried', explanation: '"Chiên giòn" = fried crispy. "Cá chiên" = fried fish, "chuối chiên" = fried banana.' },
  { front: 'xào', back: 'stir-fried', explanation: '"Rau xào" = stir-fried vegetables. A quick, high-heat wok technique common in daily cooking.' },
  { front: 'hấp', back: 'steamed', explanation: '"Cá hấp" = steamed fish. Steaming preserves delicate flavors and is considered a healthy cooking method.' },
  { front: 'luộc', back: 'boiled', explanation: '"Gà luộc" = boiled chicken, a simple but important dish in Vietnamese culture, especially for ancestral offerings.' },
  { front: 'kho', back: 'braised / caramelized', explanation: '"Cá kho tộ" = caramelized fish in clay pot. Cooked slowly with fish sauce, sugar, and pepper until deeply savory.' },
  { front: 'rim', back: 'simmered in sauce', explanation: 'Similar to "kho" but usually with a thinner, sweeter sauce. "Tôm rim" = shrimp simmered in caramel sauce.' },
  { front: 'trộn', back: 'mixed / tossed (as in salad)', explanation: '"Gỏi trộn" = tossed salad. The act of mixing ingredients together, often with a dressing.' },
  { front: 'cuốn', back: 'rolled / wrapped', explanation: '"Cuốn" is both a cooking method and a dish format — rolling ingredients in rice paper or lettuce leaves.' },
  { front: 'rang', back: 'dry-roasted / stir-fried without sauce', explanation: '"Cơm rang" = fried rice (northern term). "Tôm rang muối" = shrimp roasted with salt.' },

  // ── Taste descriptions ──────────────────────────────────────────────────────
  { front: 'ngon', back: 'delicious', explanation: 'The most common food compliment. "Ngon lắm!" = very delicious! "Ngon quá!" = so delicious!' },
  { front: 'cay', back: 'spicy / hot', explanation: '"Cay quá!" = too spicy! "Không cay" = not spicy. Useful when ordering if you prefer mild food.' },
  { front: 'ngọt', back: 'sweet', explanation: 'Vietnamese cuisine (especially southern) uses sugar generously. "Ngọt quá" = too sweet.' },
  { front: 'mặn', back: 'salty', explanation: '"Mặn quá" = too salty. Fish sauce makes many dishes naturally salty.' },
  { front: 'chua', back: 'sour', explanation: 'Sourness from tamarind, lime, or vinegar is a key flavor in many Vietnamese dishes.' },
  { front: 'đắng', back: 'bitter', explanation: '"Khổ qua" (bitter melon) is the most common bitter ingredient. Bitterness is valued in traditional Vietnamese medicine.' },
  { front: 'béo', back: 'rich / fatty / creamy', explanation: 'Describes richness from fat or coconut milk. "Béo ngậy" = very rich/creamy.' },
  { front: 'thơm', back: 'fragrant / aromatic', explanation: 'Used for herbs, spices, and well-cooked food. "Thơm quá!" = smells so good!' },
  { front: 'giòn', back: 'crispy / crunchy', explanation: '"Chiên giòn" = fried crispy. Describes the texture of spring rolls, crackers, and fried foods.' },
  { front: 'tươi', back: 'fresh', explanation: '"Hải sản tươi" = fresh seafood. "Tươi sống" = fresh and raw (as in sashimi).' },

  // ── Ordering at restaurants ─────────────────────────────────────────────────
  { front: 'Cho tôi xem thực đơn.', back: 'Let me see the menu, please.', explanation: '"Cho tôi" = give me / let me. "Thực đơn" = menu. A polite way to ask for the menu.' },
  { front: 'Cho tôi một phần phở bò.', back: 'I\'d like one serving of beef pho.', explanation: '"Một phần" = one serving/portion. Use this pattern: "Cho tôi + [number] + phần + [dish name]."' },
  { front: 'Tính tiền, anh ơi.', back: 'Check, please. (to a male server)', explanation: '"Tính tiền" = calculate the money = check/bill. "Anh ơi" = polite address to a man. Use "chị ơi" for a woman.' },
  { front: 'Bao nhiêu tiền?', back: 'How much does it cost?', explanation: '"Bao nhiêu" = how much/many. "Tiền" = money. The essential price-asking phrase.' },
  { front: 'Không cay được không?', back: 'Can you make it not spicy?', explanation: '"Được không?" = is it possible? A polite way to make a request. "Không cay" = not spicy.' },
  { front: 'Tôi ăn chay.', back: 'I\'m vegetarian.', explanation: '"Ăn chay" = eat vegetarian. Vietnamese Buddhism has a strong vegetarian tradition — "quán chay" = vegetarian restaurant.' },
  { front: 'Cho thêm đá.', back: 'Add more ice, please.', explanation: '"Thêm" = more/additional. "Đá" = ice. Useful for drinks in Vietnam\'s hot climate.' },
  { front: 'Ngon lắm!', back: 'It\'s very delicious!', explanation: '"Lắm" = very (placed after adjective). A genuine compliment that will make the cook happy.' },
  { front: 'Quán này nổi tiếng lắm.', back: 'This restaurant is very famous.', explanation: '"Quán" = restaurant/shop. "Nổi tiếng" = famous. A good way to praise a local eatery.' },
  { front: 'Có món gì đặc biệt không?', back: 'Do you have any specials?', explanation: '"Đặc biệt" = special. "Có ... không?" = do you have...? Pattern for yes/no questions.' },
  { front: 'Món này có cay không?', back: 'Is this dish spicy?', explanation: '"Món này" = this dish. Adding "không" at the end turns a statement into a yes/no question.' },
  { front: 'Cho tôi thêm nước mắm.', back: 'Give me more fish sauce, please.', explanation: '"Thêm" = more. Fish sauce is available on every table but you can always ask for more.' },

  // ── Market & shopping phrases ───────────────────────────────────────────────
  { front: 'chợ', back: 'market', explanation: 'Wet markets are central to Vietnamese food culture. "Đi chợ" = go to market (also means grocery shopping).' },
  { front: 'siêu thị', back: 'supermarket', explanation: '"Siêu" = super, "thị" = market. Modern supermarkets are increasingly common in Vietnamese cities.' },
  { front: 'Cái này bao nhiêu?', back: 'How much is this?', explanation: '"Cái này" = this thing. Point at something and ask "cái này bao nhiêu?" at any market stall.' },
  { front: 'Bớt được không?', back: 'Can you give a discount?', explanation: '"Bớt" = reduce/lower. Bargaining is expected at markets. This is the essential haggling phrase.' },
  { front: 'Đắt quá!', back: 'Too expensive!', explanation: '"Đắt" = expensive, "quá" = too much. A negotiation tactic — say this with a smile before counter-offering.' },
  { front: 'Rẻ hơn đi.', back: 'Make it cheaper.', explanation: '"Rẻ" = cheap, "hơn" = more, "đi" = a particle urging action. Another haggling phrase.' },
  { front: 'Cho tôi một ký xoài.', back: 'Give me one kilogram of mangoes.', explanation: '"Ký" = kilogram (from French "kilo"). Fruits and vegetables are sold by weight at markets.' },
  { front: 'Tươi không?', back: 'Is it fresh?', explanation: 'An important question at the market. "Tươi" = fresh. Short, direct questions are normal in market Vietnamese.' },

  // ── Meals & eating culture ──────────────────────────────────────────────────
  { front: 'bữa sáng', back: 'breakfast', explanation: '"Bữa" = meal. Vietnamese breakfast is often a full savory meal — phở, bánh mì, or xôi.' },
  { front: 'bữa trưa', back: 'lunch', explanation: '"Trưa" = noon/midday. Lunch is the main meal for many Vietnamese, often eaten at a "cơm bình dân" eatery.' },
  { front: 'bữa tối', back: 'dinner', explanation: '"Tối" = evening. Family dinners typically feature shared dishes in the center of the table.' },
  { front: 'ăn sáng', back: 'to eat breakfast / to have breakfast', explanation: '"Ăn" = to eat. "Ăn sáng chưa?" (Have you had breakfast yet?) is a common greeting, not just a question about food.' },
  { front: 'ăn vặt', back: 'to snack / snacking', explanation: '"Vặt" = miscellaneous/small. Snacking culture is huge in Vietnam — street food stalls are everywhere.' },
  { front: 'Mời bạn ăn cơm.', back: 'Please eat. (meal invitation)', explanation: '"Mời" = to invite. "Ăn cơm" literally means "eat rice" but is the general term for having a meal. Said before starting to eat.' },
  { front: 'Ăn nhiều lên nhé!', back: 'Eat more!', explanation: 'A common encouragement from Vietnamese hosts. "Nhiều" = much/many, "lên" = up, "nhé" = okay?' },
  { front: 'No rồi, cảm ơn.', back: 'I\'m full, thank you.', explanation: '"No" = full (stomach), "rồi" = already. The polite way to decline more food.' },

  // ── Kitchen & utensils ──────────────────────────────────────────────────────
  { front: 'đũa', back: 'chopsticks', explanation: 'The primary eating utensil in Vietnam. Vietnamese chopsticks are typically longer and thinner than Chinese or Japanese ones.' },
  { front: 'chén', back: 'bowl (southern) / rice bowl', explanation: 'Southern term for a small bowl. In the north, "bát" is used instead.' },
  { front: 'đĩa', back: 'plate', explanation: 'A flat plate for dry dishes. "Đĩa" vs "chén/bát" (bowl) — choose based on the dish type.' },
  { front: 'muỗng', back: 'spoon (southern term)', explanation: 'Southern word. Northern Vietnamese uses "thìa." Both mean spoon.' },
  { front: 'ly', back: 'glass / cup (southern term)', explanation: '"Ly cà phê" = a glass of coffee. Northern equivalent: "cốc."' },
  { front: 'nồi', back: 'pot / cooking pot', explanation: '"Nồi cơm điện" = electric rice cooker — an indispensable appliance in every Vietnamese kitchen.' },
  { front: 'chảo', back: 'wok / frying pan', explanation: 'The essential cooking vessel for stir-frying ("xào"). Vietnamese cooking relies heavily on wok techniques.' },

  // ── Desserts & sweets ───────────────────────────────────────────────────────
  { front: 'bánh flan', back: 'crème caramel / flan', explanation: 'A French colonial legacy. Vietnamese flan uses strong coffee-flavored caramel. Often sold by street vendors.' },
  { front: 'kem', back: 'ice cream', explanation: '"Kem bơ" = avocado ice cream, "kem dừa" = coconut ice cream. Street-side ice cream is popular.' },
  { front: 'bánh trung thu', back: 'mooncake', explanation: '"Trung thu" = Mid-Autumn Festival. Mooncakes are given as gifts and eaten during this celebration (typically September/October).' },
  { front: 'chè đậu đỏ', back: 'red bean sweet soup', explanation: '"Đậu đỏ" = red bean. A popular chè (sweet soup) variety, served warm or cold with coconut milk.' },
  { front: 'bánh chuối', back: 'banana cake / banana fritter', explanation: '"Chuối" = banana. Can be baked or fried. "Chuối chiên" (fried banana) is a common street dessert.' },
  { front: 'trái cây dĩa', back: 'fruit plate', explanation: '"Trái cây" = fruit (southern), "dĩa" = plate. A common dessert course — fresh seasonal fruits artfully arranged.' },

  // ── Specialty ingredients ───────────────────────────────────────────────────
  { front: 'nước cốt dừa', back: 'coconut milk / coconut cream', explanation: '"Cốt" = essence/extract. Used in curries, desserts, and drinks. Thicker than coconut water ("nước dừa").' },
  { front: 'bột gạo', back: 'rice flour', explanation: '"Bột" = flour/powder, "gạo" = rice. The base for bánh cuốn, bánh xèo, and many other Vietnamese specialties.' },
  { front: 'bún', back: 'rice vermicelli noodles', explanation: 'Thin, round rice noodles used in bún chả, bún riêu, bún bò Huế. Distinct from "phở" (flat rice noodles) and "miến" (glass noodles).' },
  { front: 'bánh tráng', back: 'rice paper', explanation: '"Bánh" = cake/pastry, "tráng" = to spread thin. Used for fresh and fried spring rolls. Also eaten as a snack when grilled.' },
  { front: 'mì', back: 'wheat noodles / instant noodles', explanation: '"Mì" = wheat. "Mì ăn liền" or "mì gói" = instant noodles. "Mì Quảng" uses rice-and-wheat noodles.' },
  { front: 'đậu phộng', back: 'peanuts', explanation: 'Southern term (northern: "lạc"). Crushed peanuts are sprinkled on many dishes — bánh cuốn, gỏi cuốn, mì Quảng.' },
  { front: 'mè', back: 'sesame seeds', explanation: 'Northern term: "vừng." Used in desserts, crackers ("bánh tráng mè"), and as a topping.' },

  // ── Regional food culture ───────────────────────────────────────────────────
  { front: 'Món Bắc', back: 'Northern Vietnamese cuisine', explanation: '"Bắc" = north. Known for subtle, balanced flavors. Less sugar and chili than southern food. Hanoi is the culinary capital.' },
  { front: 'Món Nam', back: 'Southern Vietnamese cuisine', explanation: '"Nam" = south. Sweeter and more herbaceous. Saigon (Hồ Chí Minh City) is the street food capital.' },
  { front: 'Món Trung', back: 'Central Vietnamese cuisine', explanation: '"Trung" = central. Huế cuisine is the most complex — known for elaborate royal dishes and bold spiciness.' },
  { front: 'đặc sản', back: 'local specialty', explanation: '"Đặc sản vùng này là gì?" = What is the local specialty here? Every province in Vietnam has signature dishes.' },
  { front: 'quán ăn', back: 'restaurant / eatery', explanation: '"Quán" = establishment, "ăn" = eat. Covers everything from street stalls to sit-down restaurants.' },
  { front: 'hàng quán', back: 'food stall / street vendor', explanation: '"Hàng" = shop/goods. Refers to small food businesses, often family-run. "Hàng phở" = a phở stall.' },
  { front: 'nhà hàng', back: 'restaurant (formal)', explanation: '"Nhà" = house, "hàng" = business. More formal than "quán ăn." Used for sit-down restaurants with table service.' },
  { front: 'quán cà phê', back: 'coffee shop / café', explanation: 'Coffee culture is integral to Vietnamese social life. Cafés range from tiny sidewalk stools to elaborate themed spaces.' },
]
