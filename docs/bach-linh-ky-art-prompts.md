# Bách Linh Kỳ: prompt tạo ảnh

Bộ prompt để tạo ảnh cho chế độ chơi Bách Linh Kỳ: 50 nhân vật, 15 bản đồ, 5 hành, 4 loại địa hình, 5 linh địa và các hiệu ứng. Nội dung bám theo dữ liệu trong `src/features/games/bach-linh-ky/` (`monsters.ts`, `maps.ts`, `art.tsx`, `rules.ts`).

Phần mô tả viết bằng tiếng Việt, còn prompt viết bằng tiếng Anh vì các công cụ tạo ảnh (Midjourney, Stable Diffusion, DALL·E, Imagen, Flux...) hiểu tiếng Anh tốt hơn.

## Mục lục

1. [Cách dùng](#1-cách-dùng)
2. [Phong cách chung](#2-phong-cách-chung)
3. [Ngũ hành](#3-ngũ-hành)
4. [Nhân vật](#4-nhân-vật)
5. [Địa hình](#5-địa-hình)
6. [Linh địa](#6-linh-địa)
7. [Bản đồ](#7-bản-đồ)
8. [Hiệu ứng](#8-hiệu-ứng)
9. [Quân cờ và giao diện](#9-quân-cờ-và-giao-diện)
10. [Kiểm tra trước khi đưa vào game](#10-kiểm-tra-trước-khi-đưa-vào-game)

## 1. Cách dùng

Mỗi ảnh được ghép từ ba phần, theo đúng thứ tự:

```text
[KHUNG của loại ảnh] + [MÔ TẢ riêng của ảnh đó] + [STYLE chung]
```

Sau cùng thêm `NEGATIVE` vào ô negative prompt (nếu công cụ không có ô này thì nối vào cuối, sau chữ `Avoid:`).

Ví dụ ảnh nhân vật Sơn Tinh:

```text
Character portrait for a round game token, single figure, centered, head and upper body filling a circle, facing three-quarters toward the viewer, clear silhouette readable at 64 px, plain background in the element colour with a faint Đông Sơn bronze-drum ring pattern. Subject: Sơn Tinh, god of Mount Tản Viên, a towering calm warrior with a topknot, bare shoulders draped in a tiger-skin sash, raising one hand as jagged peaks rise behind him, a stone staff in the other. Element Earth: ochre yellow #c9952f and dark amber #8a6118 medallion, mint-jade magical glow #7dffcf. Vietnamese sơn mài lacquer painting crossed with Đông Hồ woodblock folk print, bold dark ink outlines, flat layered colour with gold-leaf and crushed-eggshell inlay accents, Đông Sơn bronze-drum geometric motifs, Lý and Trần dynasty costume and ornament, stylised 2D game illustration, crisp edges, no text.
```

Tỉ lệ khuyên dùng:

| Loại ảnh | Tỉ lệ | Kích thước xuất | Nền |
| --- | --- | --- | --- |
| Nhân vật (quân cờ) | 1:1 | 1024 × 1024, dùng trong vòng tròn | Màu hành |
| Nhân vật (thẻ sưu tập) | 3:4 | 1152 × 1536 | Cảnh theo hành |
| Ô địa hình, linh địa | 1:1 | 512 × 512, ghép liền mép | Kín ô |
| Bản đồ | 1:1 | 2048 × 2048 (lưới 8 × 8) | Kín ảnh |
| Hiệu ứng | 1:1 | 1024 × 1024 | Đen tuyền hoặc trong suốt |
| Biểu tượng hành | 1:1 | 512 × 512 | Trong suốt |

Mẹo giữ cho cả bộ ảnh đồng nhất:

- Tạo trước vài ảnh ưng ý rồi dùng làm ảnh tham chiếu phong cách (`--sref` của Midjourney, IP-Adapter hoặc style reference của công cụ khác) cho mọi ảnh còn lại.
- Giữ nguyên một `seed` cho từng nhóm ảnh (10 nhân vật cùng hành, 5 linh địa...).
- Không đổi câu chữ của phần `STYLE` giữa các ảnh, chỉ đổi phần mô tả.

## 2. Phong cách chung

Game đang vẽ quân cờ như huy hiệu sơn mài tô theo màu hành, bàn cờ màu giấy dó và gỗ. Bộ ảnh nên đi theo hướng đó: sơn mài, tranh Đông Hồ, hoa văn trống đồng Đông Sơn.

`STYLE` (nối vào cuối mọi prompt):

```text
Vietnamese sơn mài lacquer painting crossed with Đông Hồ woodblock folk print, bold dark ink outlines, flat layered colour with gold-leaf and crushed-eggshell inlay accents, Đông Sơn bronze-drum geometric motifs, Lý and Trần dynasty costume and ornament, stylised 2D game illustration, crisp edges, no text.
```

`NEGATIVE`:

```text
text, letters, numbers, watermark, signature, logo, frame, border, photo, photorealism, 3D render, anime, chibi, Chinese hanfu, Japanese kimono, samurai armour, European fantasy armour, extra limbs, extra fingers, blurry, low contrast, cluttered background, cropped head
```

Lưu ý về văn hóa:

- Trang phục, kiến trúc, vũ khí theo thời Hùng Vương, Lý, Trần: khố, áo giao lĩnh, khăn vấn, nón, giáo, rìu đồng, trống đồng, mái đình cong. Tránh áo dài cách tân, tránh nét Trung Hoa hay Nhật Bản.
- Các Thánh Mẫu, Đức Thánh Trần, các vị vua và danh tướng là nhân vật được thờ phụng: vẽ trang nghiêm, kín đáo, không gợi cảm, không biếm họa.
- Yêu quái (Chằn Tinh, Ngư Tinh, Xương Cuồng...) được phép dữ dằn nhưng không máu me.

## 3. Ngũ hành

Màu lấy đúng từ `ELEMENT_COLOR` và `ELEMENT_GLOW` trong `art.tsx`. Câu ở cột "Câu màu" được chèn vào prompt của mọi nhân vật thuộc hành đó.

| Hành | Màu chính | Màu đậm | Màu phát sáng | Câu màu |
| --- | --- | --- | --- | --- |
| Kim | `#e9dfc6` | `#b49b5e` | `#5fc8ff` | `Element Metal: pale ivory-gold #e9dfc6 and antique bronze #b49b5e medallion, cold sky-blue magical glow #5fc8ff.` |
| Mộc | `#2f7d52` | `#1c5236` | `#9dff7a` | `Element Wood: jade green #2f7d52 and deep forest green #1c5236 medallion, fresh lime magical glow #9dff7a.` |
| Thủy | `#25466e` | `#142b47` | `#7fd8ff` | `Element Water: deep indigo blue #25466e and blue-black #142b47 medallion, bright aqua magical glow #7fd8ff.` |
| Hỏa | `#b8392d` | `#7e2119` | `#ffd23f` | `Element Fire: vermilion red #b8392d and dark crimson #7e2119 medallion, golden-yellow magical glow #ffd23f.` |
| Thổ | `#c9952f` | `#8a6118` | `#7dffcf` | `Element Earth: ochre yellow #c9952f and dark amber #8a6118 medallion, mint-jade magical glow #7dffcf.` |

### Biểu tượng từng hành

Khung:

```text
Round emblem icon, single symbol centered, symmetric, thick outline, readable at 24 px, transparent background.
```

| Hành | Mô tả |
| --- | --- |
| Kim | `Symbol of Metal: a crossed bronze sword and dagger-axe over a Đông Sơn drum star, ivory-gold and bronze, sky-blue glint.` |
| Mộc | `Symbol of Wood: a banyan tree with spreading roots and a single unfurling leaf, jade green, lime glow on the leaf veins.` |
| Thủy | `Symbol of Water: a curling wave shaped like a Lý dynasty dragon's back, indigo blue, aqua foam.` |
| Hỏa | `Symbol of Fire: a Lý dynasty flame-leaf motif with three tongues, vermilion, golden core.` |
| Thổ | `Symbol of Earth: a three-peaked mountain over terraced rice-field lines, ochre, mint-jade glint at the summit.` |

### Vòng tương sinh, tương khắc

Tương khắc: Kim → Mộc → Thổ → Thủy → Hỏa → Kim. Tương sinh: Kim → Thủy → Mộc → Hỏa → Thổ → Kim.

```text
Diagram illustration of the five elements arranged as a pentagon of five round emblems (Metal ivory-gold, Water indigo, Wood jade green, Fire vermilion, Earth ochre). A soft glowing outer ring of flowing arrows joins them clockwise in the order Metal, Water, Wood, Fire, Earth (the feeding cycle). An inner five-pointed star of sharp red-edged arrows joins Metal to Wood, Wood to Earth, Earth to Water, Water to Fire, Fire to Metal (the overcoming cycle). Aged dó paper background with a faint bronze-drum pattern, no labels.
```

## 4. Nhân vật

Có hai khung, dùng chung phần mô tả của từng nhân vật.

`KHUNG QUÂN CỜ` (ảnh tròn trên bàn cờ, cần rõ ở cỡ nhỏ):

```text
Character portrait for a round game token, single figure, centered, head and upper body filling a circle, facing three-quarters toward the viewer, clear silhouette readable at 64 px, plain background in the element colour with a faint Đông Sơn bronze-drum ring pattern. Subject:
```

`KHUNG THẺ SƯU TẬP` (ảnh lớn trong bộ sưu tập và lễ triệu hồi):

```text
Full-body collectible card illustration, single figure in a dynamic pose, low camera angle, the figure fills two thirds of the frame, simple atmospheric background that fits its legend, rim-lit by its element's magical glow. Subject:
```

Cấp bậc nên thể hiện qua độ cầu kỳ, để nhìn là biết quân mạnh hay yếu:

| Cấp | Thêm vào cuối phần mô tả |
| --- | --- |
| 1 | `Small, humble, simple shapes, no gold.` |
| 2 | `Modest, a single gold accent.` |
| 3 | `Confident, a few gold accents, faint aura.` |
| 4 | `Imposing, rich gold inlay, visible aura.` |
| 5 | `Majestic and divine, heavy gold-leaf inlay, radiant halo and swirling aura.` |

Ký hiệu trong các bảng dưới: đường đi `bộ` / `thủy` / `bay`; cột "Điểm nhấn" là chi tiết gắn với kỹ năng, nên giữ để người chơi nhận ra quân.

### 4.1 Hành Kim

Thêm câu màu của Kim sau phần mô tả.

| Cấp | Nhân vật | Đường đi | Điểm nhấn | Mô tả (prompt) |
| --- | --- | --- | --- | --- |
| 1 | Chim Lạc | bay | Hình chim trên trống đồng | `Chim Lạc, the sacred Lạc bird from Đông Sơn bronze drums, a slender long-beaked, long-crested water bird in flight, body patterned with bronze-drum geometry, wings spread wide.` |
| 1 | Ma Trành | bộ | Đội lốt hổ | `Ma Trành, a pale thin ghost of a tiger's victim in torn peasant clothes, hunched and hollow-eyed, casting a huge tiger-shaped shadow behind it, a tiger pelt hooded over its head.` |
| 2 | Đại Bàng | bay | Móng vuốt lớn | `Đại Bàng, the giant eagle of the Thạch Sanh tale, enormous bronze-feathered raptor with a hooked steel beak and oversized talons, wings beating, fierce eye.` |
| 2 | Ông Ba Mươi | bộ | Thế vồ mồi | `Ông Ba Mươi, the feared forest tiger, a muscular orange-and-black tiger in the Hàng Trống folk painting style, crouched mid-pounce with claws out, bold swirling stripes.` |
| 3 | Con Kìm | bộ | Trấn giữ, che tên | `Con Kìm, a temple-roof guardian with a dragon's head and a fish's upturned tail, glazed ceramic and bronze scales, jaws clamped on a roof ridge, stern protective gaze.` |
| 3 | Cao Biền | bộ | Bùa và kiếm đồng | `Cao Biền, a cold-eyed geomancer sorcerer in dark robes and a tall cap, holding a paper talisman in one hand and a bronze sword point-down in the other, sealing sigils drifting around him.` |
| 4 | An Dương Vương | bộ | Nỏ thần | `King An Dương Vương, builder of Cổ Loa, a dignified bearded king in a feathered bronze-age crown and scale armour, aiming the magic Liên Châu crossbow whose trigger is a glowing turtle claw.` |
| 4 | Lý Thường Kiệt | bộ | Thế thủ che chở | `Lý Thường Kiệt, a Lý dynasty general in lamellar armour and a plumed helmet, standing firm with a long spear planted and a shield raised, banner streaming behind, resolute face.` |
| 5 | Bạch Hổ | bộ | Tiếng gầm, thế vồ | `Bạch Hổ, the sacred White Tiger of the West, a huge white tiger with black stripes and blue-glowing eyes, roaring mid-leap, wind and metal sparks curling from its fur.` |
| 5 | Trần Hưng Đạo | bộ | Kiếm chỉ hướng tiến quân | `Trần Hưng Đạo, Saint Trần, a revered elder commander with a long grey beard, Trần dynasty armour under a ceremonial robe, pointing a sword forward to rally troops, calm and commanding.` |

### 4.2 Hành Mộc

Thêm câu màu của Mộc sau phần mô tả.

| Cấp | Nhân vật | Đường đi | Điểm nhấn | Mô tả (prompt) |
| --- | --- | --- | --- | --- |
| 1 | Mộc Tinh non | bộ | Bắn gai | `A sapling spirit, a small walking young tree with a curious face in its bark, leafy tuft of hair, twig arms flicking sharp thorns like darts.` |
| 1 | Ma Cây Gạo | bộ | Tay rễ níu chân | `Ma Cây Gạo, a ghost living in an old kapok tree with red blossoms, a pale long-haired wraith leaning out of the trunk, root-like hands reaching low to grab an ankle, night mist.` |
| 2 | Chú Cuội | bộ | Lá đa thần | `Chú Cuội, a barefoot young woodcutter in a brown tunic, sitting against the roots of a glowing magic banyan tree, holding up one shining healing leaf, a crescent moon behind him.` |
| 2 | Vượn Thần | bộ | Chuyền cành vượt núi | `A spirit ape, a long-armed white-browed gibbon with moss-green fur and flower garlands, swinging from a vine across a cliff, agile and bright-eyed.` |
| 3 | Bạch Kê Tinh | bay | Tiếng gáy mê hoặc | `Bạch Kê Tinh, the white rooster demon of Cổ Loa, a large ghostly white rooster with a blood-red comb and long trailing tail feathers, crowing with visible spiralling sound rings, perched on a broken wall at night.` |
| 3 | Tiên Dung | bộ | Che chở đồng minh | `Princess Tiên Dung of the Hùng kings, a graceful young woman in layered green silk and a gold headdress, holding a parasol protectively, river sandbank and reeds behind her.` |
| 4 | Chử Đồng Tử | bộ | Gậy và nón hóa thành quách | `Chử Đồng Tử, one of the Four Immortals, a serene young ascetic in simple robes, planting a wooden staff and holding a conical hat, a glowing citadel wall rising from the ground around him.` |
| 4 | Chằn Tinh | bộ | Sức mạnh thuần túy | `Chằn Tinh, a hulking man-eating ogre with green-grey skin, tusks, a wild mane and a necklace of bones, bursting out of a jungle shrine with clawed fists raised.` |
| 5 | Mẫu Thượng Ngàn | bộ | Dây leo trói địch | `Mẫu Thượng Ngàn, the Holy Mother of the Forests, a serene goddess in emerald-green court robes and a green khăn chầu headdress with gold pins, seated in a misty mountain forest, living vines flowing from her sleeves.` |
| 5 | Mộc Tinh Xương Cuồng | bộ | Vỏ cây ngàn năm | `Xương Cuồng, a thousand-year tree demon, a colossal gnarled ancient tree with a snarling face in its trunk, bark as thick as armour, branch arms like clubs, glowing green eyes, roots tearing through the earth.` |

### 4.3 Hành Thủy

Thêm câu màu của Thủy sau phần mô tả.

| Cấp | Nhân vật | Đường đi | Điểm nhấn | Mô tả (prompt) |
| --- | --- | --- | --- | --- |
| 1 | Ma Da | thủy | Tay vươn khỏi mặt nước | `Ma Da, a drowned water ghost, a pale child-sized figure with long wet black hair covering half its face, rising from dark river water among duckweed, one hand reaching out.` |
| 1 | Cá Chép | thủy | Vượt vũ môn hóa rồng | `A red-gold carp leaping up a waterfall toward a carved Dragon Gate, its whiskers and fins beginning to turn into a dragon's, spray all around.` |
| 2 | Mai An Tiêm | bộ | Dưa hấu | `Mai An Tiêm, a sun-browned exiled man in a simple loincloth and headcloth, on a sandy island shore, cradling a watermelon and holding a split one showing bright red flesh, sea behind him.` |
| 2 | Dã Tràng | thủy | Mai cua cứng | `Dã Tràng, a sturdy sand crab with a thick domed shell patterned like bronze-drum rings, rolling small sand balls on a beach, waves washing in, claws raised defensively.` |
| 3 | Ngưu Tinh | thủy | Húc dưới nước, gọi mưa | `Ngưu Tinh, a water buffalo demon, a massive dark buffalo with sweeping crescent horns and glowing eyes, charging out of a lake in a burst of water, rain clouds gathering above.` |
| 3 | Ngư Tinh | thủy | Phun nước tầm xa | `Ngư Tinh, the sea fish demon, a monstrous giant fish with a gaping fanged mouth, spiny dorsal fins and many fin-legs, rearing out of stormy East Sea waves, spitting a jet of water.` |
| 4 | Thủy Tinh | thủy | Dâng nước | `Thủy Tinh, the Water God, a fierce long-haired god in blue-black scale armour with a fish-fin crown, riding a rising flood wave, trident raised, storm clouds and rain behind him.` |
| 4 | Thuồng Luồng | thủy | Sóng dữ đánh đắm thuyền | `Thuồng Luồng, a river serpent dragon with a long snake body, four short clawed legs and a crested head, coiling out of a river and capsizing a small wooden boat.` |
| 5 | Lạc Long Quân | thủy | Hóa rồng | `Lạc Long Quân, the Dragon Lord, a majestic king with a strong calm face, wearing a dragon-crest crown and sea-blue robes patterned with waves, half transformed, a great Lý dynasty dragon coiling behind him out of the sea.` |
| 5 | Mẫu Thoải | thủy | Nước cam lồ hồi sinh | `Mẫu Thoải, the Holy Mother of Waters, a serene goddess in white court robes and a white khăn chầu headdress with silver pins, seated on a lotus above calm water, pouring glowing healing water from a small vase.` |

### 4.4 Hành Hỏa

Thêm câu màu của Hỏa sau phần mô tả.

| Cấp | Nhân vật | Đường đi | Điểm nhấn | Mô tả (prompt) |
| --- | --- | --- | --- | --- |
| 1 | Cóc Tía | bộ | Kiện trời, gọi mưa | `Cóc Tía, a small proud purple-red toad with warty skin, standing upright and beating a tiny drum toward the sky, a rain cloud forming overhead, defiant expression.` |
| 1 | Ma Trơi | bay | Đốm lửa lập lòe | `Ma Trơi, a will-o'-the-wisp, a floating blue-and-yellow ghost flame with a faint mischievous face, drifting over grave mounds at night, trailing sparks.` |
| 2 | Hồ Tinh | bộ | Biến hình | `Hồ Tinh, the nine-tailed fox of Dạ Trạch marsh, a sleek russet fox with nine flame-tipped tails fanned out, half its face behind a human theatre mask, sly glowing eyes.` |
| 2 | Ông Táo | bộ | Lửa bếp, cá chép | `Ông Táo, the Kitchen God, a cheerful round-faced mandarin in a winged hat and red robe, riding a large carp, holding a scroll, warm hearth flames glowing beneath.` |
| 3 | Xà Tinh | bộ | Phun độc lửa | `Xà Tinh, a thousand-year fire serpent, a huge coiled snake with red-and-black scales and a flared hood, spitting a short stream of burning venom, embers rising.` |
| 3 | Ngựa Sắt | bay | Phun lửa, bay lên trời | `The Iron Horse of Saint Gióng, a riveted black iron war horse with glowing seams, breathing a jet of fire, galloping upward through the air, mane and tail made of flame.` |
| 4 | Phượng Hoàng | bay | Tái sinh từ tro tàn | `Phượng Hoàng, the phoenix of the South, an elegant fire bird with a long curling tail in the Lý dynasty carving style, rising with spread wings from a nest of glowing ashes.` |
| 4 | Thần Sét | bay | Búa đá giáng sét | `Thần Sét, the Thunder God, a dark-skinned muscular god with wild hair and a fierce scowl, flying among storm clouds, swinging a stone axe-hammer that throws a forked lightning bolt downward.` |
| 5 | Phù Đổng Thiên Vương | bộ | Vươn vai thành tráng sĩ | `Saint Gióng, Phù Đổng Thiên Vương, a giant young hero in iron armour and an iron helmet, stretching to full height, swinging an uprooted bamboo clump as a weapon, fire and dust around his feet.` |
| 5 | Mẫu Liễu Hạnh | bộ | Biến hóa khôn lường | `Mẫu Liễu Hạnh, the Holy Mother and first of the Four Immortals, a radiant dignified goddess in red court robes and a red khăn chầu headdress with gold phoenix pins, holding a fan, her outline flickering into a second ghostly silhouette, peach blossoms drifting.` |

### 4.5 Hành Thổ

Thêm câu màu của Thổ sau phần mô tả.

| Cấp | Nhân vật | Đường đi | Điểm nhấn | Mô tả (prompt) |
| --- | --- | --- | --- | --- |
| 1 | Thạch Tinh | bộ | Đá núi biết đi | `Thạch Tinh, a stone spirit, a squat mossy boulder that has come alive, with a cracked rocky face, stubby stone arms and legs, small glowing eyes, climbing a rocky slope.` |
| 1 | Rùa Con | thủy | Mai cứng | `A little turtle with an oversized hard domed shell patterned in hexagons, peeking out shyly, arrows bouncing harmlessly off the shell, pond edge and pebbles.` |
| 2 | Lân | bộ | Múa xua tà, hộ vệ | `Lân, the Vietnamese unicorn of the Four Sacred Beasts, a lion-dog body with scales, a single horn, a curly mane and a big festive lion-dance face, prancing protectively.` |
| 2 | Ông Địa | bộ | Bụng phệ, quạt mo | `Ông Địa, the Earth God, a bald pot-bellied smiling man with an open vest and a palm-leaf fan, patting the ground where a small hill is rising, friendly and humorous.` |
| 3 | Từ Đạo Hạnh | bộ | Dời hình đổi bóng | `Từ Đạo Hạnh, a Lý dynasty Zen master in brown monk's robes with prayer beads, hands forming a mudra, two translucent mirrored after-images of himself swapping places, floating stones around him.` |
| 3 | Voi Chín Ngà | bộ | Chín ngà | `The Nine-Tusk Elephant, a huge war elephant with nine ivory tusks fanned across its face, wearing a red-and-gold ceremonial howdah cloth, stomping forward heavily.` |
| 4 | Mẫu Địa | bộ | Đầm lầy trói chân | `Mẫu Địa, the Holy Mother of the Earth, a serene goddess in golden-yellow court robes and a yellow khăn chầu headdress with gold pins, seated on fertile ground, rice sprouting around her, soft mud swirling at her gesture.` |
| 4 | Nghê | bộ | Giữ cổng đình | `Nghê, the Vietnamese guardian beast of temple gates, a dog-lion with a long body, flame-like mane, bushy tail and a playful yet stern grin, sitting upright on a stone plinth.` |
| 5 | Sơn Tinh | bộ | Dời non, dựng núi | `Sơn Tinh, god of Mount Tản Viên, a towering calm warrior with a topknot, bare shoulders draped in a tiger-skin sash, raising one hand as jagged peaks rise behind him, a stone staff in the other.` |
| 5 | Kim Quy | thủy | Mai thần, nỏ thần | `Kim Quy, the divine Golden Turtle, an ancient giant turtle with a gleaming gold shell engraved with bronze-drum patterns, wise whiskered face, one raised claw glowing as it becomes the trigger of a magic crossbow.` |

### 4.6 Cặp nhân vật

Ảnh ghép hai nhân vật, dùng cho màn giới thiệu "Đồng tâm" và "Mối thù thiên thu".

Khung:

```text
Two-figure illustration, both characters fully visible, wide 16:9 composition. Subject:
```

| Quan hệ | Cặp | Mô tả |
| --- | --- | --- |
| Đồng tâm | Chử Đồng Tử và Tiên Dung | `Chử Đồng Tử and Princess Tiên Dung standing side by side on a river sandbank, his staff and conical hat planted beside them, a glowing citadel rising behind, gentle golden thread of light linking them.` |
| Đồng tâm | An Dương Vương và Kim Quy | `King An Dương Vương kneeling by the sea as the Golden Turtle Kim Quy offers him a glowing claw, the magic crossbow in the king's hands, Cổ Loa citadel in the distance.` |
| Đồng tâm | Phù Đổng và Ngựa Sắt | `Saint Gióng in iron armour riding the fire-breathing Iron Horse at full gallop, swinging a bamboo clump, flames trailing behind.` |
| Đồng tâm | Sơn Tinh và Voi Chín Ngà | `Sơn Tinh the Mountain God standing beside the Nine-Tusk Elephant loaded with wedding gifts, mountains at dawn behind them.` |
| Đồng tâm | Mẫu Thượng Ngàn và Vượn Thần | `Mẫu Thượng Ngàn, Holy Mother of the Forests, seated in a misty forest while the Spirit Ape offers her fruit from a branch above.` |
| Đồng tâm | Ông Ba Mươi và Ma Trành | `The tiger Ông Ba Mươi prowling through a night forest, the pale ghost Ma Trành walking ahead holding a dim lantern to lead it to prey.` |
| Mối thù thiên thu | Sơn Tinh và Thủy Tinh | `Sơn Tinh the Mountain God on a rising peak facing Thủy Tinh the Water God on a towering flood wave, the frame split diagonally between ochre rock and indigo water, lightning overhead.` |

## 5. Địa hình

Ô vuông nhìn thẳng từ trên xuống, ghép liền mép với các ô bên cạnh. Bàn cờ là 8 × 8, quân cờ tròn đặt đè lên, nên ô phải dịu màu và ít chi tiết ở giữa.

`KHUNG Ô`:

```text
Top-down orthographic square game tile, seamless edges that tile with neighbours, soft even lighting, no perspective, no cast shadows crossing the edges, low-contrast centre so a round token placed on top stays readable. Tile:
```

| Địa hình | Luật | Mô tả (prompt) |
| --- | --- | --- |
| Đồng bằng (sáng) | Ô thường | `Plain ground, pale dó-paper beige #e8d9b5 packed earth with faint dry grass strokes and a subtle woven-mat texture.` |
| Đồng bằng (tối) | Ô thường, tông xen kẽ kiểu bàn cờ | `Plain ground, slightly darker warm tan packed earth with faint dry grass strokes, same texture as the light plain tile.` |
| Núi | Chỉ quân bay vượt qua, quân biết leo núi mới đứng lên được | `Mountain, a cluster of steep grey-brown limestone peaks seen from above with dark crevices and a little moss, clearly impassable, peaks stay inside the tile.` |
| Sông | Quân đi bộ bước vào thì dừng, quân thủy đi như đất bằng | `River, flowing blue-green water with stylised white curling wave lines in the Đông Hồ print manner, darker toward the centre.` |
| Miếu | Quân đứng trên miếu không bị đánh tầm xa | `Shrine, a small red-roofed village miếu seen from above with curved tiled eaves, a stone incense urn in front, a low protective wall around it, warm ochre courtyard.` |
| Đền thiêng (của người chơi) | Quân của mình đặt chân lên được +1 cấp, dùng một lần | `Sacred temple, a grand tiered temple roof seen from above with gold ridge dragons, a glowing gold octagonal platform in the centre for a token to stand on, gold light rising.` |
| Đền thiêng (của Tianwu) | Như trên, cho phe đối thủ | `Sacred temple, a grand tiered temple roof seen from above with dark lacquer ridge dragons, a glowing deep-crimson octagonal platform in the centre for a token to stand on, crimson light rising.` |
| Đền thiêng (đã dùng) | Hết tác dụng | `Sacred temple after its power is spent, the same tiered roof seen from above, the central platform dull grey stone with a cold extinguished incense urn, no glow.` |

Ô chuyển tiếp nên tạo thêm để bản đồ liền mạch: bờ sông (thẳng, góc trong, góc ngoài), chân núi (thẳng, góc). Thêm vào cuối mô tả: `transition tile, the left half is plain ground and the right half is [river / mountain foot], soft natural boundary.`

## 6. Linh địa

Mỗi hành có một loại đất thiêng. Quân cùng hành đứng trên đó được +1 cấp, và mỗi loại có thêm một luật riêng. Dùng `KHUNG Ô` ở phần 5, thêm câu sau để phân biệt với địa hình thường:

```text
Sacred elemental ground: a thin glowing ring of the element's light runs around the tile's inner edge, with the element's symbol faintly etched in the centre.
```

| Linh địa | Hành | Luật riêng | Mô tả (prompt) |
| --- | --- | --- | --- |
| Mỏ đồng | Kim | Đứng trên mỏ bắn xa thêm 1 ô | `Copper ore ground, dark rock split by bright veins of raw copper and bronze nuggets, a few cast bronze arrowheads and a Đông Sơn drum fragment half buried, sky-blue #5fc8ff glints on the metal.` |
| Rừng | Mộc | Đứng trong rừng không bị đánh tầm xa | `Dense forest ground seen from above, overlapping dark green tree canopies with a small clearing in the centre, vines and ferns, lime #9dff7a fireflies of light between the leaves.` |
| Đầm lầy | Thủy | Quân đi bộ bước vào thì dừng lại | `Marsh ground, murky blue-green shallow water with mud patches, lotus leaves, reeds and duckweed, slow ripples, aqua #7fd8ff glimmer on the surface.` |
| Dung nham | Hỏa | Chỉ quân Hỏa đứng lên được, quân bay chỉ lướt qua | `Lava ground, cracked black basalt plates with bright orange-red molten rock glowing in the cracks, rising embers, golden #ffd23f hot spots, clearly dangerous.` |
| Gò đất | Thổ | Quân đứng trên gò không bị trói, không bị đổi chỗ | `Earth mound, a low rounded hill of packed ochre earth seen from above with concentric terrace rings, a small stone marker on top, tufts of grass, mint-jade #7dffcf light in the ring grooves.` |

## 7. Bản đồ

Bàn cờ 8 × 8. Mỗi bản đồ được định nghĩa bằng nửa trên (hàng 0 đến 3, phía Tianwu); nửa dưới là ảnh lật gương của nửa trên. Hàng trên cùng và dưới cùng luôn là đồng bằng để dàn quân.

Có hai cách làm ảnh bản đồ:

1. **Ghép từ ô** (nên dùng): tạo các ô ở phần 5 và 6 rồi xếp theo sơ đồ. Chính xác tuyệt đối với luật chơi.
2. **Vẽ nguyên tấm**: dùng prompt bên dưới để có một tấm nền liền mạch, sau đó kiểm tra từng ô với sơ đồ (công cụ tạo ảnh hay đặt sai vị trí). Nên đưa sơ đồ ô vuông làm ảnh điều khiển (ControlNet, image reference) để bố cục khớp.

Ngoài ảnh bàn cờ, mỗi bản đồ nên có một ảnh bìa (16:9) cho màn chọn bản đồ.

`KHUNG BÀN CỜ`:

```text
Top-down orthographic game board illustration, square 1:1, an 8 by 8 grid of equal square cells with thin subtle grid lines, the bottom half is an exact mirror image of the top half, the top row and the bottom row are open plain ground, muted colours so round tokens stay readable, no characters, no perspective. Layout:
```

`KHUNG ẢNH BÌA`:

```text
Wide 16:9 landscape establishing shot, no characters, dramatic but calm, layered depth, room for a title in the lower third. Scene:
```

Ký hiệu sơ đồ: `.` đồng bằng, `^` núi, `~` sông, `m` miếu, `a` đền thiêng, `o` mỏ đồng, `f` rừng, `w` đầm lầy, `l` dung nham, `d` gò đất.

### 7.1 Núi Tản Viên

Núi non trùng điệp, lối đi hẹp.

```text
........
..^..^..
.^^a.^^.
...^^..m
```

- Bàn cờ: `Mount Tản Viên: ranks of limestone peaks forming narrow passes, two mountain clusters left and right in the second and third rows, a central ridge of two peaks near the middle line, one sacred temple tucked between the peaks left of centre, one small shrine at the right edge near the middle line, misty ochre and grey-green highland ground.`
- Ảnh bìa: `Mount Tản Viên (Ba Vì) at dawn, three sacred peaks above a sea of cloud, a stone temple gate on a ridge, pine trees, ochre and jade light.`

### 7.2 Sông Hồng

Dòng sông chia đôi trận địa, chỉ hai bến cạn để lội qua.

```text
........
.....~..
.a..~~..
~~~~~..~
```

- Bàn cờ: `Red River: a broad reddish-brown silt river running across the whole middle of the board, crossed only by two shallow sandy fords two cells wide right of centre, a tributary branching up toward the top right, a sacred temple on the left bank, green paddy-field plains on both sides.`
- Ảnh bìa: `The Red River at sunset, wide reddish silt-laden water, sandbanks, bamboo rafts moored at a ford, rice paddies and a distant village.`

### 7.3 Hồ Gươm

Mặt hồ lớn giữa trận, hai miếu cổ canh hai bên bờ.

```text
........
.m....m.
..~~~~a.
..~~~~..
```

- Bàn cờ: `Sword Lake: one large calm jade-green lake four cells wide and four cells tall in the exact centre of the board, open ground all around it, two small old shrines on the left and right shores in the second row, a sacred temple on the right shore touching the water, willow trees on the banks.`
- Ảnh bìa: `Hồ Gươm, the Lake of the Returned Sword, in early morning mist, a small stone tower on an islet, willow branches, still jade water, a faint glint of a sword beneath the surface.`

### 7.4 Đầm Dạ Trạch

Đầm lầy loang lổ, quân hệ Thủy tung hoành.

```text
........
.~..~..~
~.a~..~.
.~..~~..
```

- Bàn cờ: `Dạ Trạch Marsh: scattered irregular pools and channels of dark water dotted across the three middle rows of each half like a patchwork, reed beds and lotus between them, narrow winding dry paths, one sacred temple on a dry islet left of centre.`
- Ảnh bìa: `Dạ Trạch, the Marsh of One Night, at dusk, endless reeds and lotus ponds, fog, will-o'-the-wisps, a hidden bamboo camp on stilts.`

### 7.5 Làng Phù Đổng

Làng quê nhiều miếu, lũy tre làm vách che.

```text
........
m..^^..m
...a....
.^.m..^.
```

- Bàn cờ: `Phù Đổng Village: a northern Vietnamese village, three small shrines per half (two at the left and right edges, one near the middle line), thick impassable bamboo hedges standing in for mountains in short clumps, a sacred temple in the village centre, thatched roofs, a pond and dirt lanes as plain ground.`
- Ảnh bìa: `Phù Đổng village in the age of the Hùng kings, thatched houses behind a tall bamboo hedge, a communal house with a curved roof, giant footprints filled with water in the fields.`

### 7.6 Thành Cổ Loa

Thành xoáy ốc, tường thành vòng vèo, cửa ra vào hiếm hoi.

```text
........
.^^^.^^.
.^a..m^.
...^^...
```

- Bàn cờ: `Cổ Loa Citadel: spiral rammed-earth ramparts acting as impassable walls, a broken ring of wall in each half with only a few narrow gates, a sacred temple and a small shrine sheltered inside the ring, a short wall segment across the centre line, moats hinted at in the earth colour.`
- Ảnh bìa: `Cổ Loa, the spiral citadel, seen from a hill, three concentric earthen ramparts and moats, watchtowers, a white rooster silhouette on a wall at night.`

### 7.7 Lò đúc Đông Sơn (Kim)

Mỏ đồng khắp nơi: quân Kim thêm sức, ai đứng trên mỏ cũng bắn xa thêm một ô.

```text
........
..o..o..
.^o..o^a
...oo...
```

- Bàn cờ: `Đông Sơn Foundry: two vertical seams of glowing copper ore in each half meeting as a block of four ore cells at the centre of the board, two rock outcrops flanking them, a sacred temple at the right edge, the plain ground is soot-dark earth with casting pits, moulds and scattered bronze drums.`
- Ảnh bìa: `A Đông Sơn bronze foundry by a river, clay furnaces glowing, molten bronze poured into a drum mould, finished bronze drums and axes stacked, smoke and sparks.`

### 7.8 Rừng Thượng Ngàn (Mộc)

Rừng rậm che kín: đứng trong rừng không bị bắn trúng.

```text
........
.f....f.
ff.a.ff.
..ff..f.
```

- Bàn cờ: `The Upland Forest: thick clumps of dense tree canopy in the left and right thirds of each half, smaller groves near the centre line, mossy clearings as plain ground, a sacred temple in a central glade, fallen logs and streams of light.`
- Ảnh bìa: `The upland forest of Mẫu Thượng Ngàn, giant ancient trees, hanging vines, mist, a small green shrine at the foot of a banyan, shafts of light.`

### 7.9 Đầm Lạc Việt (Thủy)

Đầm lầy và sông ngòi: quân đi bộ sa chân là dừng, quân Thủy bơi lội tự do.

```text
........
..w..w..
~w..a.w~
~~w..w~~
```

- Bàn cờ: `Lạc Việt Marshes: open river water filling the left and right edges around the centre line, bands of muddy marsh with lotus and reeds stepping inward from both sides, a dry central causeway two cells wide, a sacred temple on the causeway right of centre.`
- Ảnh bìa: `The marshes of the Lạc Việt, stilt houses over water, long dugout boats with bird-feathered rowers as on bronze drums, herons, low morning sun.`

### 7.10 Làng Cháy (Hỏa)

Nơi ngựa sắt Thánh Gióng phun lửa: dung nham chỉ quân Hỏa đặt chân được.

```text
........
.l....l.
..l.a.l.
ll..ll..
```

- Bàn cờ: `The Burnt Village: streaks and pools of glowing lava scattered across scorched black ground, two lava pools on the left edge and two in the centre along the middle line, charred house frames and burnt bamboo as plain ground, a sacred temple standing untouched right of centre, drifting embers.`
- Ảnh bìa: `Làng Cháy, a village scorched by the Iron Horse's fire, blackened bamboo with yellow-striped scars, smouldering ground, glowing cracks, a red sky.`

### 7.11 Gò Đống Đa (Thổ)

Gò đất nhấp nhô: quân đứng trên gò không bị trói, không bị dời chỗ.

```text
........
..d..d..
.d.^^.da
d..dd..d
```

- Bàn cờ: `The Mounds of Đống Đa: many rounded earthen mounds scattered evenly over ochre ground, a pair of mounds side by side at the centre line and one at each edge, a short rocky ridge of two peaks in the middle of each half, a sacred temple at the right edge, banyan trees and dry grass.`
- Ảnh bìa: `Gò Đống Đa, a field of grassy burial mounds under old banyan trees at dusk, war banners planted on a mound, ochre dust in the air.`

### 7.12 Trận Ngũ Hành

Đủ năm loại linh địa: mỗi hành có một chỗ đứng của mình.

```text
........
.o.f.l..
w..a..d.
..^..^..
```

- Bàn cờ: `The Five Elements Array: a ritual battleground on a great stone bagua-like platform, in each half one cell each of copper ore, forest and lava in a row, one marsh cell at the left edge and one earth mound near the right edge, a sacred temple at the centre of each half, two stone pillars as mountains near the middle line, five coloured light channels carved in the floor.`
- Ảnh bìa: `A vast stone ritual platform under a night sky, five glowing altars for Metal, Wood, Water, Fire and Earth arranged in a pentagon, light channels joining them.`

### 7.13 Đảo hoang

Hòn đảo nơi Mai An Tiêm trồng dưa: biển bao quanh hai bờ, lối giữa đảo rộng mở.

```text
........
~~~..~~~
~.a..m.~
~......~
```

- Bàn cờ: `The Desert Island: turquoise sea filling the left and right edges and cutting in as two bays in each half, leaving a sandy island with a wide open centre and a two-cell land bridge to each home row, a sacred temple and a small shrine on the sand, watermelon vines and driftwood.`
- Ảnh bìa: `Mai An Tiêm's desert island, white sand, a patch of watermelon vines with ripe melons, seabirds, a melon carved with marks floating out to sea.`

### 7.14 Thành Thăng Long

Hai lớp tường thành chắn giữa trận, chỉ có hai cổng để qua.

```text
........
.^^..^^.
...a....
^^.^^.^^
```

- Bàn cờ: `Thăng Long Citadel: brick ramparts with tiled tops as impassable walls, an outer wall in the second row of each half with a wide central gate, and a thicker inner wall along the middle line pierced by exactly two gates, a sacred temple in the courtyard between the walls, paved courtyards with dragon-pattern tiles.`
- Ảnh bìa: `Thăng Long imperial citadel in the Lý dynasty, tiered gates, dragon stairways, red lacquered palaces, a golden dragon rising in the clouds above.`

### 7.15 Sông Bạch Đằng

Lòng sông cắm đầy cọc gỗ: chỉ quân bay và quân thủy luồn qua dễ dàng.

```text
........
........
~^~a~^~~
~~~^~~^~
```

- Bàn cờ: `Bạch Đằng River: a wide grey-green tidal river filling the four middle rows of the board, clusters of sharpened iron-tipped wooden stakes rising from the water as impassable cells, a sacred temple on a small sandbar in the river left of centre, two open rows of muddy bank on each side, mangroves.`
- Ảnh bìa: `The Bạch Đằng river at low tide, rows of huge sharpened wooden stakes emerging from the water, small war boats waiting in the reeds, limestone cliffs, dawn fog.`

## 8. Hiệu ứng

Hiệu ứng vẽ trên nền đen tuyền (để dùng chế độ hòa trộn `screen` hoặc `add`) hoặc nền trong suốt. Nếu cần hoạt ảnh, tạo dải khung hình.

`KHUNG HIỆU ỨNG`:

```text
Game VFX sprite, isolated on a pure black background, centered, no characters, no ground, glowing painterly brush strokes with gold-leaf sparks, high contrast, square 1:1. Effect:
```

Cho dải khung hình, thêm: `sprite sheet, 8 frames in one horizontal row, consistent size and position, showing the effect from start to fade-out.`

### 8.1 Hiệu ứng theo hành

Dùng khi quân ra đòn, khi được +1 cấp nhờ tương khắc, tương sinh hoặc linh địa.

| Hành | Đòn đánh | Hào quang đứng yên |
| --- | --- | --- |
| Kim | `A sweeping crescent slash of white-gold metal light with flying bronze shards and sky-blue #5fc8ff sparks.` | `A slow ring of floating bronze blades and sky-blue glints.` |
| Mộc | `Thorned vines and leaves bursting outward in a whip-like arc, lime #9dff7a glow.` | `A ring of drifting leaves and curling young shoots, lime glow.` |
| Thủy | `A crashing curled wave with stylised white foam claws, aqua #7fd8ff glow.` | `A ring of orbiting water droplets and ripples, aqua glow.` |
| Hỏa | `A roaring burst of Lý-style flame tongues, vermilion edge and golden #ffd23f core, flying embers.` | `A ring of small steady flames and rising embers, golden glow.` |
| Thổ | `Jagged ochre rock spikes erupting upward with dust and pebbles, mint-jade #7dffcf cracks of light.` | `A ring of slowly orbiting stones and dust, mint-jade glow.` |

Tương khắc và tương sinh:

- Tương khắc (+1 khi giao chiến): `Two elemental energies colliding, the stronger one shattering the other into fragments, a sharp red-gold impact line between them.` Thay `two elemental energies` bằng cặp cụ thể, ví dụ `a wave of water extinguishing a burst of fire`.
- Tương sinh (+1 khi bị đánh, đứng cạnh đồng minh sinh ra mình): `A soft stream of light flowing from one glowing orb into another and making it brighter, gentle spiral motion, protective feeling.`

### 8.2 Hiệu ứng kỹ năng

| Kỹ năng | Quân tiêu biểu | Mô tả (prompt) |
| --- | --- | --- |
| Dâng nước (đồng bằng thành sông) | Thủy Tinh, Cóc Tía | `Water surging up from the ground and spreading outward to fill a square, rising splash crown, aqua glow, seen from above.` |
| Dựng núi (đồng bằng thành núi) | Sơn Tinh, Chử Đồng Tử, Ông Địa | `Rock peaks thrusting up out of the ground with a ring of dust and flying stones, ochre and grey, seen from above.` |
| Giáng sét | Thần Sét | `A thick forked lightning bolt striking straight down into a bright impact burst, golden-white core with vermilion edges, scorch ring.` |
| Vồ, nhảy xa | Ông Ba Mươi, Bạch Hổ, Lạc Long Quân | `A high curved motion arc of light with speed lines ending in a claw-shaped impact mark and a dust ring.` |
| Trói chân | Mẫu Thượng Ngàn, Ma Cây Gạo, Bạch Kê Tinh, Mẫu Địa | `Glowing roots and vines coiling up from the ground into a tight binding ring, lime-green light, small leaves.` |
| Yểm bùa (lộ mặt, mất kỹ năng) | Cao Biền | `A red paper talisman with abstract seal marks slamming down, chains of pale light locking around a circle, a bronze sword pinning the centre.` |
| Đổi chỗ | Từ Đạo Hạnh | `Two swirling portals of mint-jade light exchanging two streaks of light in a yin-yang spiral.` |
| Lên cấp | Cá Chép, Phù Đổng | `A rising column of golden light with upward-flying sparks and an ascending dragon-shaped wisp.` |
| Gọi lại đồng minh | Chú Cuội, Mẫu Thoải | `A soft descending beam of light with falling glowing banyan leaves and water droplets, a faint silhouette forming inside.` |
| Tái sinh | Phượng Hoàng | `A pile of grey ash igniting into a spiralling pillar of flame shaped like spreading phoenix wings.` |
| Hào quang tấn công | Trần Hưng Đạo, Ông Táo | `A pulsing ring of red-gold light on the ground with small upward sword-shaped rays, energetic.` |
| Hào quang phòng thủ | Lý Thường Kiệt, Tiên Dung, Nghê | `A pulsing ring of blue-gold light on the ground with small shield-shaped petals, calm and steady.` |
| Che tên cho đồng minh | Con Kìm, Lân | `A translucent golden dome shield with a tiled-roof pattern, arrows bouncing off it into sparks.` |
| Không bị đánh tầm xa | Xương Cuồng, Dã Tràng, Rùa Con, Kim Quy | `A hexagonal turtle-shell pattern of light flashing on impact, an arrow deflected with a spark.` |
| Mạnh hơn trên sông | Ma Da, Ngưu Tinh, Thuồng Luồng | `Water swirling upward around a centre in a rising spiral, aqua glow, droplets flung outward.` |
| Giả cấp, biến hình | Ma Trành, Hồ Tinh, Mẫu Liễu Hạnh | `A theatre mask of smoke dissolving to one side to reveal a bright light behind it, purple #9a5fe0 and gold.` |

### 8.3 Hiệu ứng trận đấu

| Tình huống | Mô tả (prompt) |
| --- | --- |
| Giao chiến cận chiến | `A radial clash burst, pale gold centre #ffeda0 fading to red #dc2626, crossed slash marks and flying sparks.` |
| Bắn tầm xa | `A glowing arrow of light with a long thin trail flying left to right, ending in a small impact star.` |
| Lật quân (lộ mặt) | `A round lacquer token mid-flip seen edge-on, a flash of gold light sweeping across it, small sparks.` |
| Đánh úp (tấn công quân còn úp, +1) | `A sudden slash of light cutting through a veil of dark smoke from behind.` |
| Quân ngã xuống | `A round medallion cracking apart into fragments that dissolve into drifting smoke and fading sparks.` |
| Đồng tâm (+1 khi đứng cạnh người cùng truyện) | `Two orbs of light joined by a bright golden thread that pulses, small lotus petals drifting along it.` |
| Mối thù thiên thu | `Ochre rock and indigo water energies crashing head-on in a jagged vertical line, lightning along the seam.` |
| Bước lên đền thiêng (+1 cấp) | `A pillar of gold light rising from an octagonal platform, a ring of floating gold glyph-like abstract shapes, incense smoke curling upward.` |
| Bước lên linh địa cùng hành (+1 cấp) | `A ring of light rising from the ground around a centre, tinted in the element colour, small particles drawn upward.` |
| Sa lầy (quân đi bộ vào sông, đầm lầy) | `A muddy splash ring with slow heavy droplets and ripples, muted blue-brown.` |
| Dung nham chặn đường | `A wall of heat haze and embers rising from glowing cracks, warning red-orange.` |

### 8.4 Lễ triệu hồi

Màn triệu hồi quân mới vào bộ sưu tập.

| Thành phần | Mô tả (prompt) |
| --- | --- |
| Trận đồ | `A circular summoning array seen from above, concentric rings patterned like a Đông Sơn bronze drum face with a many-pointed star at the centre, flying Lạc birds on the outer ring, glowing gold lines on black.` |
| Cột sáng theo hành | `A tall pillar of light bursting upward from a ring on the ground, swirling particles, tinted [element colour], bright white core.` |
| Quân hiếm (cấp 4, 5) | `A blinding gold starburst with a rising Lý dynasty dragon made of light and falling gold-leaf flakes.` |
| Quân đã có | `A soft, brief silver shimmer fading quickly, a few falling sparks.` |
| Nền màn triệu hồi | Dùng `KHUNG ẢNH BÌA`: `The inside of an ancient communal house at night, lacquered wooden columns with gold dragons, an altar with a large bronze drum lying flat as a summoning table, incense smoke, candles, deep red and gold.` |

### 8.5 Kết thúc trận

Dùng `KHUNG ẢNH BÌA`.

- Thắng: `Victory scene, golden dawn over a quiet battlefield, banners raised, lotus petals and gold-leaf flakes in the air, a bronze drum in the foreground.`
- Thua: `Defeat scene, dusk and drifting smoke over the same battlefield, a broken banner, a face-down lacquer token lying on the ground, muted indigo and grey.`

## 9. Quân cờ và giao diện

Dùng `KHUNG HIỆU ỨNG` nhưng đổi nền thành trong suốt.

| Thành phần | Mô tả (prompt) |
| --- | --- |
| Mặt úp của quân cờ | `Back of a round game token, dark red lacquer #5a1414, a dashed gold ring and a gold diamond seal in the centre, blank space in the middle for a number, fine gold-leaf speckle.` |
| Viền quân người chơi | `Empty round token frame, bright gold rim #e2b84a with a thin pale-gold inner line, raised lacquer edge, empty transparent centre.` |
| Viền quân Tianwu | `Empty round token frame, near-black lacquer rim #1a1a22 with a thin grey-violet inner line, raised lacquer edge, empty transparent centre.` |
| Nền quân theo hành | `Round lacquer medallion background, radial gradient from [màu chính] at the upper left to [màu đậm] at the edge, faint bronze-drum rings, empty centre.` |
| Ô gợi ý di chuyển | `A small soft dark-blue dot marker with a faint glow.` |
| Ô gợi ý tấn công | `A red circular target ring with a soft red outer glow.` |
| Ô gợi ý bắn | `A red crosshair ring with four short tick marks.` |
| Ô gợi ý kỹ năng | `A rounded square outline in violet #7c3aed with a soft violet glow.` |
| Quân đang chọn | `A white ring with a warm gold outer glow.` |
| Dấu bị trói | `A small round badge showing a knotted vine loop, green on dark.` |
| Dấu bị yểm | `A small round badge showing a red paper talisman strip, on dark red #9b2c22.` |
| Khung bàn cờ | `A square wooden board frame in dark lacquered wood with gold corner fittings engraved with bronze-drum patterns, empty centre.` |

Linh vật Tianwu (đối thủ máy) đã có hình riêng trong `public/stickers`, nên dùng lại thay vì tạo mới.

## 10. Kiểm tra trước khi đưa vào game

- Ảnh quân cờ vẫn nhận ra nhân vật khi thu về 64 × 64 px, và không bị mất chi tiết quan trọng khi cắt tròn (góc dưới phải còn bị huy hiệu cấp che).
- Mười quân cùng hành nhìn ra chung một màu, năm hành phân biệt được với nhau, kể cả với người mù màu (dựa thêm vào hình dáng, không chỉ màu).
- Ô địa hình ghép liền mép, không lộ đường nối, quân cờ đặt lên vẫn nổi.
- Ảnh bàn cờ vẽ nguyên tấm khớp từng ô với sơ đồ trong `maps.ts`, nửa dưới đúng là ảnh gương của nửa trên.
- Không có chữ, số, chữ ký hay logo lọt vào ảnh.
- Hiệu ứng có bản tĩnh thay thế cho người bật `prefers-reduced-motion`.
- Trang phục và kiến trúc đúng chất Việt, các nhân vật được thờ phụng được vẽ trang nghiêm.
- Kiểm tra điều khoản bản quyền của công cụ tạo ảnh trước khi dùng ảnh trong sản phẩm.
