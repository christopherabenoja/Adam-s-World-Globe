import type { ContinentConfig, CountryFeature } from '../types/globe';

// Curated kid-friendly geographic & cultural fun facts for all countries and territories
export const COUNTRY_FACTS: Record<string, string[]> = {
  Afghanistan: [
    'The tall Hindu Kush mountains stretch right across the middle of Afghanistan.',
    'Lapis lazuli, a bright royal-blue stone used in art for thousands of years, comes from here.',
  ],
  Aland: [
    'Aland is a peaceful group of more than 6,500 islands in the Baltic Sea!',
    'People here love sailing and cycling between islands connected by bridges and ferries.',
  ],
  Albania: [
    'Over two-thirds of Albania is covered in rugged mountains and green valleys.',
    'Albanians call their country Shqiperia, which means "Land of the Eagles."',
  ],
  Algeria: [
    'Algeria is the largest country in Africa, and most of it is part of the golden Sahara Desert.',
    'Fennec foxes with huge ears live in Algeria’s desert sands to stay cool!',
  ],
  'American Samoa': [
    'American Samoa sits in the sunny South Pacific Ocean and is made of volcanic islands.',
    'Sea turtles and colorful coral reefs thrive around its turquoise lagoons.',
  ],
  Andorra: [
    'Andorra is a tiny mountain country tucked high up in the Pyrenees between France and Spain.',
    'It has no airport or train station—you travel there along winding mountain roads!',
  ],
  Angola: [
    'Kalandula Falls in Angola is one of the widest and grandest waterfalls in Africa.',
    'Baobab trees with giant bottle-shaped trunks grow across Angola’s savannas.',
  ],
  Anguilla: [
    'Anguilla is a flat coral island in the Caribbean known for more than 30 white sandy beaches.',
    'Sailboat racing is the favorite national sport on its bright blue waters.',
  ],
  Antarctica: [
    'Antarctica holds about 90% of all the ice on Earth!',
    'No one lives here permanently, only scientists who study penguins, glaciers, and stars.',
  ],
  'Antigua and Barbuda': [
    'Antigua is famous for saying it has 365 beaches—one for every single day of the year!',
    'Frigatebirds with giant red throat pouches nest on the island of Barbuda.',
  ],
  Argentina: [
    'The highest mountain outside Asia, Aconcagua, towers in Argentina’s Andes.',
    'Magellanic penguins waddle along Argentina’s rocky southern coast.',
  ],
  Armenia: [
    'Mount Ararat rises dramatically across the horizon from Armenia’s capital, Yerevan.',
    'Yerevan is called the "Pink City" because many buildings are made from rosy volcanic stone.',
  ],
  Aruba: [
    'Divi-divi trees in Aruba all lean in the same direction because of steady ocean trade winds!',
    'Pink flamingos stroll along the calm turquoise beaches here.',
  ],
  Australia: [
    'Australia is both a country and an entire continent, home to kangaroos, koalas, and platypuses!',
    'The Great Barrier Reef off Australia’s coast is the largest coral reef system on Earth.',
  ],
  Austria: [
    'Snowy Alpine mountains cover most of Austria, making it famous for skiing and hiking.',
    'Famous music composers like Mozart lived and wrote symphonies in Austria.',
  ],
  Azerbaijan: [
    'Azerbaijan sits beside the Caspian Sea, the largest enclosed inland body of water on Earth.',
    'It is nicknamed the "Land of Fire" because natural flames flicker from rocky hillsides.',
  ],
  Bahamas: [
    'The Bahamas is made up of over 700 sunny islands and cays in the Atlantic Ocean!',
    'The water around the islands is so clear and shallow that astronauts can spot its bright turquoise from space.',
  ],
  Bahrain: [
    'Bahrain is an island kingdom in the Persian Gulf connected to Saudi Arabia by a 25-kilometer bridge.',
    'For thousands of years, divers in Bahrain searched the sea for natural pearls.',
  ],
  Bangladesh: [
    'More than 700 rivers wind through Bangladesh into the world’s largest river delta!',
    'The Sundarbans mangrove forest here is home to the majestic Bengal tiger.',
  ],
  Barbados: [
    'Barbados is an eastern Caribbean island built mostly out of ancient coral limestone.',
    'Flying fish leap over the waves around Barbados and are a national symbol.',
  ],
  Belarus: [
    'Belarus has vast ancient forests where rare European bison still roam free.',
    'Storks build giant nests on chimneys and rooftops across the countryside.',
  ],
  Belgium: [
    'Belgium is famous around the world for crispy waffles, delicious chocolate, and comic books like The Smurfs!',
    'Brussels is a crossroads of Europe where people speak French, Dutch, and German.',
  ],
  Belize: [
    'The Great Blue Hole off Belize is a giant underwater sinkhole loved by divers and sea turtles.',
    'Toucans and howler monkeys live in Belize’s lush tropical rainforests.',
  ],
  Benin: [
    'In Ganvie, a village in Benin, houses stand on wooden stilts above a lake—people travel by canoe!',
    'Royal palaces in Abomey tell stories through colorful clay wall carvings.',
  ],
  Bermuda: [
    'Some beaches in Bermuda actually have soft pink sand tinted by tiny crushed coral shells!',
    'Colorful pastel houses here have stepped white roofs designed to catch clean rainwater.',
  ],
  Bhutan: [
    'Tucked high in the Himalayas, Bhutan measures success by "Gross National Happiness"!',
    'Tiger’s Nest monastery clings dramatically to the side of a steep mountain cliff.',
  ],
  Bolivia: [
    'Salar de Uyuni in Bolivia is the largest salt flat in the world—after rain it turns into a giant sky mirror!',
    'Lake Titicaca, shared with Peru, is the highest large navigable lake on Earth.',
  ],
  'Bosnia and Herzegovina': [
    'Emerald-green rivers wind beneath historic stone bridges across Bosnia and Herzegovina.',
    'Its capital Sarajevo hosted the 1984 Winter Olympics in the surrounding mountains.',
  ],
  Botswana: [
    'The Okavango Delta in Botswana is an amazing inland river delta that blooms right inside a desert!',
    'More African elephants live in Botswana than in any other country on Earth.',
  ],
  Brazil: [
    'Brazil holds most of the Amazon Rainforest, the largest tropical forest on our planet!',
    'The mighty Amazon River carries more water than any other river in the world.',
  ],
  'British Indian Ocean Territory': [
    'These remote coral atolls sit in the middle of the warm Indian Ocean.',
    'Its surrounding waters form one of the largest marine nature reserves on Earth.',
  ],
  'British Virgin Islands': [
    'More than 50 green volcanic islands and coral cays make up the British Virgin Islands.',
    'Giant smooth granite boulders on Virgin Gorda create secret sea caves called The Baths.',
  ],
  Brunei: [
    'Kampong Ayer in Brunei is a centuries-old water village of wooden walkways built over a river.',
    'Thick tropical rainforests cover more than 70% of the country.',
  ],
  Bulgaria: [
    'Bulgaria’s Rose Valley blooms with millions of fragrant roses every spring.',
    'Its snowy Rila Mountains hold seven glacial lakes stacked like giant steps.',
  ],
  'Burkina Faso': [
    'Burkina Faso’s name means "Land of Honest People."',
    'Skilled artists in Tiebele paint geometric black, white, and red patterns on mud-brick homes.',
  ],
  Burundi: [
    'Burundi sits along Lake Tanganyika, the longest freshwater lake in the world.',
    'Traditional drummers in Burundi perform energetic dances with tall wooden drums.',
  ],
  'Cabo Verde': [
    'Cabo Verde is a chain of 10 volcanic islands in the Atlantic Ocean off West Africa.',
    'Loggerhead sea turtles return to its sandy beaches every summer to lay eggs.',
  ],
  Cambodia: [
    'Angkor Wat in Cambodia is the largest ancient temple complex ever built in the world!',
    'Tonle Sap lake grows huge during the monsoon season when its river actually flows backward.',
  ],
  Cameroon: [
    'Cameroon is often called "Africa in miniature" because it has rainforests, beaches, savannas, and tall volcanoes!',
    'Mount Cameroon is an active volcano rising right beside the Atlantic Ocean.',
  ],
  Canada: [
    'Canada has more lakes than all the other countries in the world combined!',
    'The maple leaf is Canada’s national symbol, and its sap makes sweet maple syrup.',
  ],
  'Cayman Islands': [
    'Sea turtles and stingrays swim in the clear turquoise lagoons around the Cayman Islands.',
    'A glowing bay on Grand Cayman sparkles bright blue at night thanks to tiny sea plankton.',
  ],
  'Central African Republic': [
    'Dzanga-Sangha rainforest here is home to rare forest elephants and western lowland gorillas.',
    'Colorful butterflies flutter in huge clouds along forest streams.',
  ],
  Chad: [
    'Chad has dramatic desert rock arches in the Ennedi plateau that look like giant stone sculptures.',
    'Lake Chad lies where four countries meet at the edge of the Sahara.',
  ],
  Chile: [
    'Chile is a super long, narrow country stretching over 4,200 kilometers down South America’s coast!',
    'The Atacama Desert in northern Chile is one of the driest places on Earth, great for stargazing.',
  ],
  China: [
    'The Great Wall of China winds over mountains and deserts for more than 21,000 kilometers!',
    'Giant pandas live wild in the misty bamboo forests of central China.',
  ],
  Colombia: [
    'Colombia has coasts on both the Pacific Ocean and the Caribbean Sea, plus the tall Andes mountains!',
    'More species of colorful hummingbirds and songbirds live in Colombia than in any other country.',
  ],
  Comoros: [
    'The Comoros islands sit between Madagascar and Africa and are called the "Perfume Islands" for their fragrant flowers.',
    'Mount Karthala on Grande Comore has one of the largest active volcanic craters in the world.',
  ],
  'Cook Islands': [
    'Fifteen sunlit islands scattered across the South Pacific form the Cook Islands.',
    'Aitutaki Lagoon is famous for bright turquoise water and tiny sandy islands called motus.',
  ],
  'Costa Rica': [
    'Even though Costa Rica is small, it holds about 5% of all plant and animal species on Earth!',
    'Sloths, red-eyed tree frogs, and scarlet macaws live in its cloud forests and rainforests.',
  ],
  Croatia: [
    'Croatia has over a thousand islands dotted along the clear blue Adriatic Sea.',
    'The spotted Dalmatian dog breed gets its name from Croatia’s sunny Dalmatia coast!',
  ],
  Cuba: [
    'Cuba is the largest island in the Caribbean and is shaped a bit like a swimming crocodile!',
    'The bee hummingbird—the tiniest bird in the entire world—lives in Cuba.',
  ],
  Curacao: [
    'Brightly painted Dutch-style houses in yellow, pink, and blue line the harbor of Willemstad.',
    'A floating pontoon bridge swings open like a gate to let ships pass through!',
  ],
  Cyprus: [
    'Cyprus is a sunny island in the eastern Mediterranean Sea with sandy bays and pine-topped mountains.',
    'Olive trees here can live for many hundreds of years.',
  ],
  Czechia: [
    'Czechia is known as the land of a thousand castles—many look right out of a fairy tale!',
    'Prague’s historic Astronomical Clock has been telling time for over 600 years.',
  ],
  'Democratic Republic of the Congo': [
    'The Congo River is the deepest river in the world and crosses the Equator twice!',
    'Okapis—shy forest animals with zebra-striped legs—live only in its rainforests.',
  ],
  Denmark: [
    'Denmark is made up of a peninsula and over 400 islands, and people love riding bicycles everywhere!',
    'LEGO toy bricks were invented in Denmark.',
  ],
  Djibouti: [
    'Lake Assal in Djibouti is one of the saltiest lakes on Earth—salt crystals sparkle along its shore!',
    'Gentle whale sharks gather each winter in the warm Gulf of Tadjoura.',
  ],
  Dominica: [
    'Dominica is called the "Nature Island" because of its 365 rivers, waterfalls, and lush rainforest peaks.',
    'Sperm whales live year-round in the deep waters just off its coast.',
  ],
  'Dominican Republic': [
    'The highest mountain in the entire Caribbean, Pico Duarte, rises in the Dominican Republic.',
    'Every winter, humpback whales swim into Samana Bay to raise their newborn calves.',
  ],
  'East Timor': [
    'East Timor sits on the eastern half of Timor Island, surrounded by coral-rich seas.',
    'Rambling green mountains rise steeply right behind its sunny beaches.',
  ],
  Ecuador: [
    'Ecuador is named after the Equator, the imaginary line around the middle of the Earth that passes right through it!',
    'The Galapagos Islands in Ecuador are home to giant tortoises and marine iguanas.',
  ],
  Egypt: [
    'The Nile River flows north through Egypt’s desert, helping green farms grow along its banks.',
    'Ancient Egyptians built the Great Pyramids and the Sphinx over 4,500 years ago!',
  ],
  'El Salvador': [
    'El Salvador is called the "Land of Volcanoes" because it has more than 20 volcanoes in a small space!',
    'Pacific waves along its coast make it famous for surfing.',
  ],
  'Equatorial Guinea': [
    'Part of Equatorial Guinea is on Africa’s mainland, and its capital sits on a lush volcanic island!',
    'Lush tropical forests cover most of the country.',
  ],
  Eritrea: [
    'Eritrea has a long sunny coastline along the Red Sea filled with coral reefs and colorful fish.',
    'Historic steam trains still wind up steep mountain cliffs from the coast to Asmara.',
  ],
  Estonia: [
    'Forests cover more than half of Estonia, and over 2,000 islands lie off its coast.',
    'In winter, frozen sea roads let cars drive right across the ice to islands!',
  ],
  Eswatini: [
    'Eswatini is one of Africa’s smallest countries, packed with mountains, rivers, and wildlife parks.',
    'White and black rhinos are protected inside its nature reserves.',
  ],
  Ethiopia: [
    'Ethiopia sits high on a green plateau called the "Roof of Africa," where coffee trees first grew wild!',
    'Its Simien Mountains are home to gelada monkeys with shaggy golden manes.',
  ],
  'Falkland Islands': [
    'Hundreds of thousands of king, gentoo, and rockhopper penguins live on the Falkland Islands!',
    'Cool ocean winds sweep across grassy hills and white sandy coves.',
  ],
  'Faroe Islands': [
    'Eighteen steep green volcanic islands rise dramatically out of the North Atlantic Ocean.',
    'More sheep live on the Faroe Islands than people, and puffins nest on the sea cliffs!',
  ],
  Fiji: [
    'Fiji is made up of more than 330 tropical islands in the South Pacific Ocean.',
    'The International Date Line passes right near Fiji, making it one of the first places to see each new day!',
  ],
  Finland: [
    'Finland is called the "Land of a Thousand Lakes"—it actually has about 188,000 lakes!',
    'In northern Finland, winter brings snowy Lapland and glowing green Northern Lights.',
  ],
  France: [
    'The Eiffel Tower in Paris can grow a few centimeters taller on hot summer days because metal expands in heat!',
    'France reaches from snowy Mont Blanc in the Alps to sunny beaches on the Mediterranean.',
  ],
  'French Polynesia': [
    'French Polynesia includes 118 volcanic islands and coral atolls like Tahiti and Bora Bora.',
    'Overwater bungalows sit above crystal-clear blue lagoons filled with rays and reef fish.',
  ],
  'French Southern Territories': [
    'These remote sub-Antarctic islands are home to millions of king penguins and wandering albatrosses.',
    'Only scientists and wildlife researchers visit these wild ocean islands.',
  ],
  Gabon: [
    'Thick tropical rainforests cover nearly 90% of Gabon!',
    'Along Gabon’s wild beaches, hippos and forest elephants sometimes walk right beside the ocean waves.',
  ],
  Gambia: [
    'The Gambia is the smallest country on mainland Africa, shaped like a winding ribbon around the Gambia River.',
    'More than 500 kinds of colorful birds live along its riverbanks.',
  ],
  Georgia: [
    'Snow-capped Caucasus Mountains tower above ancient stone watchtowers in Georgia.',
    'Veryovkina Cave in Georgia is the deepest known cave on Earth!',
  ],
  Germany: [
    'Germany has more than 20,000 historic castles tucked on hilltops and beside rivers!',
    'Deep green woods like the Black Forest inspired famous fairy tales.',
  ],
  Ghana: [
    'Lake Volta in Ghana is one of the largest human-made lakes in the world.',
    'Colorful hand-woven Kente cloth with bright patterns comes from Ghana.',
  ],
  Greece: [
    'Greece has thousands of sunny islands—only about 200 of them have people living on them!',
    'The Olympic Games began in ancient Greece nearly 3,000 years ago.',
  ],
  Greenland: [
    'Greenland is the largest island on Earth that is not a continent, mostly covered in a giant ice sheet!',
    'In summer, the midnight sun stays shining even in the middle of the night.',
  ],
  Grenada: [
    'Grenada is called the "Spice Island" because sweet nutmeg, cinnamon, and cacao grow across its green hills!',
    'Divers can visit a coral-covered underwater sculpture park right off its coast.',
  ],
  Guam: [
    'Guam is the largest island in Micronesia and sits near the Mariana Trench, the deepest ocean trench on Earth.',
    'Warm tropical breezes and coral reefs ring its sandy beaches.',
  ],
  Guatemala: [
    'Ancient Maya stone pyramids peek above the green jungle canopy at Tikal in Guatemala.',
    'The dazzling green-and-red quetzal bird lives in Guatemala’s misty cloud forests.',
  ],
  Guernsey: [
    'Guernsey is a small green island in the English Channel famous for gentle golden-and-white Guernsey cows.',
    'Huge ocean tides here change the shoreline twice every day.',
  ],
  Guinea: [
    'Several of West Africa’s biggest rivers—including the Niger—start in Guinea’s misty highlands.',
    'Reddish cliffs and roaring waterfalls hide inside the Fouta Djallon mountains.',
  ],
  'Guinea-Bissau': [
    'Off the coast of Guinea-Bissau, the Bijagos Archipelago is home to rare saltwater-swimming hippos!',
    'Green mangrove rivers wind past rice fields and palm trees.',
  ],
  Guyana: [
    'Kaieteur Falls in Guyana is one of the tallest single-drop waterfalls in the world—nearly five times taller than Niagara!',
    'Thick jungle covers over 80% of the country.',
  ],
  Haiti: [
    'Haiti sits on the mountainous western part of Hispaniola Island—its name means "Land of High Mountains."',
    'Vibrant paintings and metal sculptures fill markets across Haiti.',
  ],
  'Heard Island and McDonald Islands': [
    'These icy, uninhabited volcanic islands sit far out in the chilly Southern Ocean.',
    'Big Ben, an active snow-covered volcano on Heard Island, rises straight out of the sea!',
  ],
  Honduras: [
    'The Mesoamerican Barrier Reef—the second-largest coral reef in the world—runs past Honduras’s Bay Islands.',
    'Scarlet macaws fly brightly over ancient Maya carvings at Copan.',
  ],
  'Hong Kong': [
    'Hong Kong is a bustling coastal harbor city backed by steep green mountain peaks!',
    'More than 200 islands belong to Hong Kong, and double-decker trams have rolled through its streets for over 100 years.',
  ],
  Hungary: [
    'The mighty Danube River flows right through the middle of Hungary’s capital, Budapest.',
    'Lake Balaton in Hungary is the largest freshwater lake in Central Europe.',
  ],
  Iceland: [
    'Iceland is called the "Land of Fire and Ice" because volcanoes and glaciers sit right next to each other!',
    'Natural hot springs warm outdoor pools and even heat homes across the island.',
  ],
  India: [
    'India stretches from the snowy Himalayas in the north to sunny tropical beaches in the south!',
    'The game of chess was invented in ancient India, and tigers, peacocks, and elephants live in its forests.',
  ],
  'Indian Ocean Ter.': [
    'Christmas Island and the Cocos Islands sit in the Indian Ocean far from mainland continents.',
    'Millions of bright red crabs march across Christmas Island every year on their way to the sea!',
  ],
  Indonesia: [
    'Indonesia is the world’s largest island country, made up of more than 17,000 islands!',
    'Giant Komodo dragons and shy orangutans live in Indonesia’s tropical islands.',
  ],
  Iran: [
    'Iran has snowy mountain ranges, golden deserts, and colorful mosaic domes sparkling in historic cities.',
    'Hand-woven Persian carpets from Iran are famous for intricate garden patterns.',
  ],
  Iraq: [
    'The twin Tigris and Euphrates rivers flow through Iraq—this fertile valley is where the earliest cities and writing began!',
    'Date palms grow in shady green groves along the riverbanks.',
  ],
  Ireland: [
    'Ireland is nicknamed the "Emerald Isle" because rain keeps its rolling hills bright green all year!',
    'There are no wild snakes living anywhere on the island of Ireland.',
  ],
  'Isle of Man': [
    'Located in the Irish Sea, the Isle of Man has the famous tailless Manx cat breed!',
    'The Laxey Wheel on the island is the largest working waterwheel in the world.',
  ],
  Israel: [
    'The Dead Sea bordering Israel is so salty that swimmers float effortlessly on top like corks!',
    'In a single short drive, you can go from snowy Mount Hermon to coral reefs in the Red Sea.',
  ],
  Italy: [
    'Look closely at Italy on the map—it is shaped just like a tall kicking boot!',
    'Venice in Italy is built on over 100 small islands connected by canals and bridges instead of roads.',
  ],
  'Ivory Coast': [
    'Ivory Coast grows more cacao beans—used to make chocolate—than any other country in the world!',
    'Its coastal lagoons meet lush green rainforests inland.',
  ],
  Jamaica: [
    'Jamaica’s Blue Mountains grow famous coffee and look blue-tinted through the morning mist.',
    'Reggae music was born in Jamaica and is loved all around the globe.',
  ],
  Japan: [
    'Japan is a chain of mountainous islands where bullet trains speed smoothly past snow-capped Mount Fuji!',
    'Every spring, pink cherry blossoms bloom across parks and temples in Japan.',
  ],
  Jersey: [
    'Jersey is an island in the English Channel surrounded by dramatic sea cliffs and huge tidal bays.',
    'Sweet Jersey milk and sandy beaches are famous across the island.',
  ],
  Jordan: [
    'The ancient city of Petra in Jordan is carved directly into glowing rose-pink sandstone cliffs!',
    'Wadi Rum’s red sand valleys look so much like Mars that space movies are filmed there.',
  ],
  Kazakhstan: [
    'Kazakhstan is the largest landlocked country in the world—wild apple trees first grew in its mountains!',
    'Huge open grasslands called steppes stretch across the country.',
  ],
  Kenya: [
    'Millions of wildebeest, zebras, and gazelles cross Kenya’s Masai Mara grasslands every year!',
    'Mount Kenya’s snow-dusted peaks sit right near the warm Equator.',
  ],
  Kiribati: [
    'Kiribati’s 33 coral atolls stretch so wide across the Pacific Ocean that they lie in all four hemispheres of Earth!',
    'It is the very first country to welcome each new calendar day.',
  ],
  Kosovo: [
    'Kosovo is a mountain-ringed land in Southeast Europe with scenic gorges and stone bridges.',
    'The Sharr Mountains along its southern border are home to brown bears and lynx.',
  ],
  Kuwait: [
    'Kuwait sits at the northwest corner of the Persian Gulf, where desert dunes meet calm sea.',
    'The iconic blue-and-white Kuwait Towers rise high above the bay.',
  ],
  Kyrgyzstan: [
    'Snowy peaks of the Tian Shan mountains cover more than 90% of Kyrgyzstan!',
    'Elusive snow leopards prowl quietly high up on its rocky ridges.',
  ],
  Laos: [
    'Laos is a green, mountainous country in Southeast Asia without any ocean coastline.',
    'Turquoise stepped pools cascade down Kuang Si Waterfall in the forest.',
  ],
  Latvia: [
    'Thick pine and birch forests cover over half of Latvia along the Baltic Sea.',
    'The Ventas Rumba waterfall in Latvia is the widest waterfall in Europe.',
  ],
  Lebanon: [
    'Ancient cedar trees—pictured right on Lebanon’s flag—grow high on its snowy mountains!',
    'You can ski in the morning and see the warm Mediterranean coast the very same afternoon.',
  ],
  Lesotho: [
    'Lesotho is called the "Kingdom in the Sky" because every single part of the country lies over 1,000 meters above sea level!',
    'Basotho blankets and woven straw hats keep mountain riders warm.',
  ],
  Liberia: [
    'Liberia’s lush Sapo rainforest is home to rare pygmy hippopotamuses that are much smaller than river hippos!',
    'Warm Atlantic waves roll onto sandy beaches along its coast.',
  ],
  Libya: [
    'Sahara sand dunes and hidden desert oasis lakes shimmer in southern Libya.',
    'Roman stone arches still stand beside the sunny Mediterranean coast at Leptis Magna.',
  ],
  Liechtenstein: [
    'Liechtenstein is one of the smallest countries in the world, tucked between Switzerland and Austria in the Alps!',
    'A hilltop stone castle overlooks its tiny capital city, Vaduz.',
  ],
  Lithuania: [
    'A long, curved ribbon of golden sand dunes called the Curonian Spit protects Lithuania’s coast.',
    'Basketball is Lithuania’s favorite sport, and people cheer loudly for every game.',
  ],
  Luxembourg: [
    'Luxembourg is a tiny European country packed with fairytale stone castles and wooded river gorges.',
    'All public buses, trams, and trains in Luxembourg are completely free to ride!',
  ],
  Macao: [
    'Macao sits on China’s southern coast and blends historic Portuguese tiles with lively Asian street markets.',
    'Giant pandas live at the quiet park on Coloane Island.',
  ],
  Madagascar: [
    'More than 90% of Madagascar’s wildlife—including ring-tailed lemurs and funny chameleons—is found nowhere else on Earth!',
    'Giant baobab trees line the dusty red roads like upside-down trees.',
  ],
  Malawi: [
    'Lake Malawi holds more species of colorful tropical fish than any other lake on Earth!',
    'Locals call it the "Calendar Lake" because it is about 365 miles long and 52 miles wide.',
  ],
  Malaysia: [
    'The Petronas Twin Towers in Kuala Lumpur are joined by a skybridge high in the clouds!',
    'Malaysia’s Borneo rainforest is home to orangutans and the giant Rafflesia flower.',
  ],
  Maldives: [
    'The Maldives is the flattest country on Earth—made of nearly 1,200 tiny coral islands!',
    'Manta rays, whale sharks, and sea turtles glide through its bright blue lagoons.',
  ],
  Mali: [
    'In Timbuktu and Djenne in Mali, famous historic mosques and libraries are built out of sun-baked mud brick!',
    'The Niger River loops right across Mali’s dry plains like a green lifeline.',
  ],
  Malta: [
    'Malta is a small sunny Mediterranean island built from golden honey-colored limestone.',
    'Colorful traditional fishing boats called luzzus have painted eyes on the front for good luck!',
  ],
  'Marshall Islands': [
    'Over a thousand low coral islands and atolls form rings around sparkling Pacific lagoons.',
    'Traditional navigators here mapped ocean waves using woven coconut stick charts!',
  ],
  Mauritania: [
    'Look at the Sahara in Mauritania from space and you can see a giant bullseye rock formation called the Eye of the Sahara!',
    'Migrating seabirds flock by the millions along its Atlantic wetlands.',
  ],
  Mauritius: [
    'Surrounded by bright coral reefs, Mauritius is an island in the Indian Ocean once home to the famous dodo bird.',
    'At Chamarel, natural volcanic sand dunes glow in seven different rainbow colors!',
  ],
  Mexico: [
    'Millions of bright orange monarch butterflies fly thousands of kilometers to spend winter in Mexico’s mountain forests!',
    'Chocolate was first made from cacao beans in ancient Mexico.',
  ],
  Micronesia: [
    'More than 600 tropical islands dot the western Pacific Ocean in Micronesia.',
    'Ancient stone ruins at Nan Madol sit right on top of a coral reef lagoon!',
  ],
  Moldova: [
    'Rolling green hills and sunflower fields stretch across Moldova between two rivers.',
    'Milestii Mici in Moldova has hundreds of kilometers of underground limestone tunnels.',
  ],
  Monaco: [
    'Monaco is the second-smallest country in the world, packed onto rocky cliffs beside the Mediterranean Sea!',
    'Its coastal streets turn into a famous Formula 1 race track once a year.',
  ],
  Mongolia: [
    'Many families in Mongolia live in cozy round felt tents called gers that can be packed up and moved easily!',
    'More horses live on Mongolia’s wide grassy plains than people.',
  ],
  Montenegro: [
    'Montenegro’s name means "Black Mountain," after the dark pine forests climbing its dramatic peaks!',
    'The Tara River Canyon is one of the deepest river gorges in Europe.',
  ],
  Montserrat: [
    'Montserrat is nicknamed the "Emerald Isle of the Caribbean" because of its lush green volcanic peaks.',
    'Black volcanic sand beaches shimmer along its rocky coastline.',
  ],
  Morocco: [
    'In Morocco’s Atlas Mountains, clever goats sometimes climb high into argan trees to snack on fruit!',
    'The golden dunes of the Sahara desert reach right into southern Morocco.',
  ],
  Mozambique: [
    'Mozambique has a long, sunny Indian Ocean coastline lined with palm trees and coral reefs.',
    'Dugongs—gentle sea mammals related to manatees—graze on seagrass along its coast.',
  ],
  Myanmar: [
    'Thousands of ancient golden and brick temples rise across the misty plain of Bagan in Myanmar.',
    'Fishermen on Inle Lake famously balance on one leg to row their wooden boats!',
  ],
  Namibia: [
    'The Namib Desert has some of the tallest glowing red-orange sand dunes on Earth, meeting right beside the Atlantic Ocean!',
    'Desert-adapted elephants and giraffes trek across dry riverbeds here.',
  ],
  Nauru: [
    'Nauru is the smallest island country in the world—you can drive all the way around it in under half an hour!',
    'Coral limestone pillars rise out of the middle of the oval island.',
  ],
  Nepal: [
    'Eight of the ten tallest mountains on Earth—including mighty Mount Everest—tower in Nepal!',
    'Nepal is the only country in the world whose flag is not shaped like a rectangle.',
  ],
  Netherlands: [
    'About a quarter of the Netherlands sits below sea level, protected by clever dikes, pumps, and windmills!',
    'Bright fields of red, yellow, and purple tulips bloom across the countryside every spring.',
  ],
  'New Caledonia': [
    'One of the longest coral barrier reefs in the world wraps all the way around New Caledonia!',
    'Unique flightless birds called kagus bark like little dogs in its forests.',
  ],
  'New Zealand': [
    'New Zealand’s mountains, glaciers, and glowing caves are home to the shy flightless kiwi bird!',
    'Geothermal geysers shoot steam high into the air around Rotorua.',
  ],
  Nicaragua: [
    'Lake Nicaragua is so huge that rare bull sharks can swim up a river from the ocean right into the freshwater lake!',
    'Active volcanoes rise like green cones right in the middle of the lake.',
  ],
  Niger: [
    'The Air Mountains rise like rocky islands out of the vast golden Sahara Desert in Niger.',
    'Rare West African giraffes live peacefully near villages along the Niger River.',
  ],
  Nigeria: [
    'Nigeria has more people than any other country in Africa and a rich variety of music, art, and festivals!',
    'Over 500 different languages are spoken across Nigeria.',
  ],
  Niue: [
    'Niue is one of the largest raised coral islands in the world, full of coastal sea caves and chasms.',
    'Humpback whales swim close enough to watch right from the rocky shore.',
  ],
  'Norfolk Island': [
    'Tall, symmetrical Norfolk Island pines cover this tiny green island in the South Pacific.',
    'Steep cliffs overlook bright blue ocean waves.',
  ],
  'North Korea': [
    'Rugged mountains cover most of North Korea, with the snowy crater lake of Mount Paektu on its northern border.',
    'Pine forests and swift rivers cut through deep rocky valleys.',
  ],
  'North Macedonia': [
    'Ancient Lake Ohrid in North Macedonia is one of the oldest and deepest lakes in Europe.',
    'More than 200 unique plant and animal species live only in Lake Ohrid!',
  ],
  'Northern Mariana Islands': [
    'Fifteen volcanic tropical islands curve across the western Pacific near the deep Mariana Trench.',
    'Bright flame trees burst with orange-red blossoms every summer.',
  ],
  Norway: [
    'Deep blue sea inlets called fjords wind far inland between towering waterfall cliffs in Norway!',
    'In summer, northern Norway sees the Midnight Sun shine all night long.',
  ],
  Oman: [
    'Green sea turtles crawl ashore onto Oman’s beaches every year to lay thousands of eggs.',
    'Cool emerald water pools hide inside rocky desert canyons called wadis.',
  ],
  Pakistan: [
    'K2, the second-highest mountain on Earth, towers in Pakistan’s snowy Karakoram Range!',
    'The Indus River flows all the way from Himalayan glaciers down to the Arabian Sea.',
  ],
  Palau: [
    'Palau’s Rock Islands look like hundreds of lush green mushroom caps floating on bright turquoise water!',
    'Palau created the world’s first shark sanctuary to protect ocean wildlife.',
  ],
  Palestine: [
    'Ancient olive trees in Palestine have produced olives for thousands of years!',
    'The Judean hills descend eastward toward the salty Dead Sea valley.',
  ],
  Panama: [
    'The famous Panama Canal lets giant ships take a shortcut between the Atlantic and Pacific oceans!',
    'Golden frogs and colorful toucans live in Panama’s tropical cloud forests.',
  ],
  'Papua New Guinea': [
    'More than 800 languages are spoken in Papua New Guinea—more than any other country on Earth!',
    'Dazzling Birds of Paradise dance in its misty mountain rainforests.',
  ],
  Paraguay: [
    'The Itaipu Dam between Paraguay and Brazil is one of the largest hydroelectric power stations in the world.',
    'Giant river otters and colorful macaws live in Paraguay’s wetlands.',
  ],
  Peru: [
    'High in Peru’s Andes Mountains sits Machu Picchu, a famous stone city built by the Incas above the clouds!',
    'Fluffy llamas and alpacas graze across Peru’s high mountain valleys.',
  ],
  Philippines: [
    'More than 7,600 tropical islands make up the Philippines, surrounded by colorful coral reefs!',
    'The tiny Philippine tarsier has giant round eyes to help it see in the forest at night.',
  ],
  'Pitcairn Islands': [
    'With only around 50 residents, Pitcairn is one of the tiniest inhabited islands in the vast Pacific Ocean!',
    'Its surrounding waters are a huge dark-sky and marine sanctuary.',
  ],
  Poland: [
    'Ancient Bialowieza Forest in Poland is home to Europe’s heaviest land animal—the European bison!',
    'Medieval castles and colorful town squares sparkle in Krakow and Gdansk.',
  ],
  Portugal: [
    'Portugal sits on Europe’s western edge facing the Atlantic Ocean, where huge winter waves attract surfers.',
    'More than half of the world’s cork comes from Portugal’s cork oak trees!',
  ],
  'Puerto Rico': [
    'In El Yunque rainforest in Puerto Rico, tiny coqui tree frogs sing "ko-kee!" all night long!',
    'Bioluminescent bays here glow bright blue-green whenever you splash the water at night.',
  ],
  Qatar: [
    'At Khor Al Adaid in Qatar, towering desert sand dunes roll right into the blue waters of an inland sea!',
    'Traditional wooden dhow sailboats glide past Doha’s futuristic skyline.',
  ],
  'Republic of the Congo': [
    'Dense tropical forests cover two-thirds of the Republic of the Congo, sheltering lowland gorillas and chimpanzees.',
    'Only the wide Congo River separates its capital Brazzaville from Kinshasa across the water!',
  ],
  Romania: [
    'Romania’s Carpathian Mountains curve in a big arc through the heart of the country, sheltering brown bears and wolves.',
    'The Danube Delta where the Danube meets the sea is packed with pelicans and water lilies.',
  ],
  Russia: [
    'Russia is the largest country in the world—it stretches across 11 time zones in both Europe and Asia!',
    'Lake Baikal in Siberia is the deepest freshwater lake on Earth.',
  ],
  Rwanda: [
    'Rwanda is called the "Land of a Thousand Hills" because emerald green hills roll everywhere you look!',
    'Endangered mountain gorillas live safely in Rwanda’s misty bamboo volcano forests.',
  ],
  'Saint Barthelemy': [
    'Red-roofed cottages look out over sunny Caribbean bays and yacht harbors on Saint Barthelemy.',
    'Sea turtles and pelicans fish just off its white sandy beaches.',
  ],
  'Saint Helena': [
    'Saint Helena sits way out in the middle of the South Atlantic Ocean, more than 1,900 km from the nearest mainland!',
    'Jonathan, a giant tortoise living on the island, is over 190 years old—the oldest known land animal alive!',
  ],
  'Saint Kitts and Nevis': [
    'Green vervet monkeys scamper along volcanic rainforest slopes on Saint Kitts and Nevis.',
    'A scenic narrow-gauge railway circles the coastline of Saint Kitts.',
  ],
  'Saint Lucia': [
    'Two towering green volcanic peaks called the Pitons rise straight out of the blue sea on Saint Lucia!',
    'They are even pictured right on Saint Lucia’s bright blue flag.',
  ],
  'Saint Martin': [
    'Even though Saint Martin is a small island, it is peacefully shared by two countries—France and the Netherlands!',
    'Planes fly super low right over Maho Beach just before landing.',
  ],
  'Saint Pierre and Miquelon': [
    'These rugged rocky islands off Canada’s coast have bright painted wooden houses and French bakeries!',
    'Puffins and whales visit the cool North Atlantic waters around them.',
  ],
  'Saint Vincent and the Grenadines': [
    'Thirty-two sunny islands and coral cays make up this Caribbean archipelago.',
    'Tiny Tobago Cays lagoon is a favorite spot for swimming sea turtles.',
  ],
  Samoa: [
    'To Sua Ocean Trench in Samoa is a giant natural green-walled swimming hole fed by an underground ocean cave!',
    'Lush tropical waterfalls plunge straight through volcanic jungle cliffs.',
  ],
  'San Marino': [
    'Perched atop steep Mount Titano, San Marino is one of the oldest republics in the world!',
    'Three medieval stone towers guard the snowy ridge overlooking Italy.',
  ],
  'Sao Tome and Principe': [
    'These two lush volcanic islands sit right near the Equator in the Gulf of Guinea.',
    'Dramatic volcanic spires like Pico Cao Grande poke straight up out of the rainforest mist!',
  ],
  'Saudi Arabia': [
    'The Empty Quarter in Saudi Arabia is the largest continuous sand desert in the world!',
    'Colorful coral reefs filled with bright fish line its long Red Sea coast.',
  ],
  Senegal: [
    'Lake Retba in Senegal—called Pink Lake—naturally glows bright bubblegum pink from harmless salt-loving algae!',
    'Giant baobab trees stand tall across Senegal’s savannas.',
  ],
  Serbia: [
    'The Uvac River in Serbia twists and bends into huge hairpin loops through deep limestone canyons.',
    'Belgrade sits right where the Sava and Danube rivers join together.',
  ],
  Seychelles: [
    'Granite boulders sculpted by waves sit on white sandy beaches across the 115 islands of Seychelles.',
    'The coco de mer palm tree here grows the largest and heaviest seeds in the entire plant kingdom!',
  ],
  'Sierra Leone': [
    'Lush green rainforest mountains meet golden Atlantic beaches right at Freetown!',
    'Pygmy hippos and chimpanzees live inside Gola Rainforest National Park.',
  ],
  Singapore: [
    'Singapore is a sunny island city-state right near the Equator—filled with futuristic tree-shaped Supertrees!',
    'Over half of the city is shaded by parks, rooftop gardens, and nature reserves.',
  ],
  'Sint Maarten': [
    'Sint Maarten shares one tiny Caribbean island with French Saint Martin.',
    'Sailboats, coral reefs, and tropical sunsets light up Great Bay.',
  ],
  Slovakia: [
    'Slovakia has more than 6,000 caves hidden underneath its forested hills and Tatra Mountains!',
    'Beautiful stone castles stand guard above winding rivers.',
  ],
  Slovenia: [
    'Slovenia’s Postojna Cave has an underground train that carries visitors past glowing stalactites and tiny "baby dragon" olms!',
    'Forests cover more than half of this green Alpine country.',
  ],
  'Solomon Islands': [
    'Nearly a thousand forested volcanic islands and coral atolls make up the Solomon Islands.',
    'Giant clam shells and colorful reefs thrive in its quiet blue lagoons.',
  ],
  Somalia: [
    'Somalia has the longest coastline of any country on mainland Africa, wrapping around the Horn of Africa!',
    'Ancient cave paintings of cattle and giraffes decorate rocky shelters at Laas Geel.',
  ],
  Somaliland: [
    'Stunning 5,000-year-old rock art caves at Laas Geel show colorful scenes of people, dogs, and giraffes.',
    'Sunny dry plateaus step down toward the warm Gulf of Aden.',
  ],
  'South Africa': [
    'South Africa has three different capital cities—one each for laws, government, and courts!',
    'Penguins waddle on sunny Boulders Beach right near Cape Town’s Table Mountain.',
  ],
  'South Georgia and the South Sandwich Islands': [
    'Glaciers pour down snowy peaks straight to beaches crowded with hundreds of thousands of king penguins!',
    'Antarctic fur seals and albatrosses breed on these wild southern islands.',
  ],
  'South Korea': [
    'South Korea is famous for high-speed trains, mountain temples, K-pop music, and colorful autumn forests!',
    'Jeju Island off its southern coast has dormant volcanic craters and lava tubes.',
  ],
  'South Sudan': [
    'The Sudd in South Sudan is one of the largest tropical wetlands in the world, fed by the White Nile River.',
    'Huge herds of antelope migrate across its vast green floodplains.',
  ],
  Spain: [
    'Spain stretches from snowy Pyrenees mountains to sunny beaches and colorful mosaic parks in Barcelona!',
    'Flamingos wade in marshlands near southern Spain.',
  ],
  'Sri Lanka': [
    'Shaped like a teardrop off southern India, Sri Lanka is famous for Ceylon tea hills, wild elephants, and leopards!',
    'Blue whales glide right past Sri Lanka’s southern shores.',
  ],
  Sudan: [
    'In Sudan’s capital Khartoum, the Blue Nile and White Nile rivers meet to form the mighty Nile River!',
    'Ancient steep-sided sandstone pyramids stand in the desert at Meroe.',
  ],
  Suriname: [
    'Over 90% of Suriname is covered by thick, wild tropical rainforest—one of the greenest countries on Earth!',
    'Giant leatherback sea turtles nest on its sandy Atlantic beaches.',
  ],
  Sweden: [
    'Sweden has more than 260,000 islands scattered along its coasts and lakes!',
    'Every winter, artists build a brand-new hotel made completely out of river ice in northern Sweden.',
  ],
  Switzerland: [
    'Snowy Alpine peaks, crystal-blue lakes, and scenic mountain trains wind all across Switzerland!',
    'Switzerland has four official national languages: German, French, Italian, and Romansh.',
  ],
  Syria: [
    'Damascus in Syria is one of the oldest continuously lived-in cities in the world!',
    'Giant wooden waterwheels called norias have turned in the Orontes River for centuries.',
  ],
  Taiwan: [
    'Steep green mountains run right down the spine of Taiwan, with marble-walled Taroko Gorge carved by a rushing river!',
    'Colorful night markets buzz with street snacks and lanterns.',
  ],
  Tajikistan: [
    'More than 90% of Tajikistan is rugged high mountains—the Pamirs are called the "Roof of the World"!',
    'Long mountain glaciers feed icy turquoise rivers.',
  ],
  Tanzania: [
    'Mount Kilimanjaro in Tanzania is the tallest mountain in Africa—snow sits at its summit near the Equator!',
    'Lions, giraffes, and zebras roam the wide Serengeti plains.',
  ],
  Thailand: [
    'Colorful longtail boats glide past limestone sea cliffs and golden temples in Thailand!',
    'Floating markets sell mangoes, coconuts, and snacks right from wooden boats.',
  ],
  Togo: [
    'Togo is a slim coastal country in West Africa that spans sandy beaches, green hills, and savannas.',
    'Clay tower-houses called takienta stand in northern Togo’s Koutammakou valley.',
  ],
  Tonga: [
    'Tonga is a Polynesian kingdom of over 170 islands in the South Pacific Ocean.',
    'Gentle humpback whales swim into Tonga’s warm lagoons every winter to raise their calves.',
  ],
  'Trinidad and Tobago': [
    'The steelpan drum—the only acoustic musical instrument invented in the 20th century—comes from Trinidad and Tobago!',
    'Bright scarlet ibis birds roost in mangrove trees at sunset.',
  ],
  Tunisia: [
    'Tunisia is Africa’s northernmost country, where ancient Roman mosaics sit near Sahara sand dunes!',
    'Matmata in southern Tunisia has cool underground courtyard homes carved into soft rock.',
  ],
  Türkiye: [
    'Türkiye’s largest city, Istanbul, spans two different continents—Europe on one side and Asia on the other!',
    'Hot air balloons float over fairy-chimney rock cones in Cappadocia at sunrise.',
  ],
  Turkmenistan: [
    'The Karakum Desert covers most of Turkmenistan, where glowing sand dunes stretch to the horizon.',
    'Swift Akhal-Teke horses are famous for their shiny metallic-golden coats!',
  ],
  'Turks and Caicos Islands': [
    'Forty low-lying coral islands sit inside one of the biggest coral barrier reefs in the world!',
    'Friendly bottlenose dolphins and pink flamingos visit its shallow blue waters.',
  ],
  Uganda: [
    'Lush green forests in Uganda shelter half of the world’s endangered mountain gorillas!',
    'Lake Victoria, Africa’s largest lake, borders southern Uganda.',
  ],
  Ukraine: [
    'Ukraine’s wide golden wheat fields and bright blue skies actually inspired the yellow and blue colors of its flag!',
    'Carpathian mountain forests shade the western edge of the country.',
  ],
  'United Arab Emirates': [
    'The Burj Khalifa in Dubai is the tallest building in the entire world—reaching over 828 meters into the sky!',
    'Golden desert dunes meet gleaming coastal cities along the Persian Gulf.',
  ],
  'United Kingdom': [
    'Great Britain is an island home to England, Scotland, and Wales, joined by the Channel Tunnel under the sea to France!',
    'Bright red double-decker buses roll past Big Ben and London’s Tower Bridge.',
  ],
  'United States': [
    'The United States spans 50 states—from Hawaii’s tropical volcanoes and Alaska’s glaciers to the giant Grand Canyon!',
    'Giant sequoia trees in California are among the largest living things on Earth.',
  ],
  Uruguay: [
    'Uruguay sits along the sunny Atlantic coast of South America with wide rolling grasslands and friendly beaches.',
    'Most of Uruguay’s electricity comes from clean wind, water, and solar power!',
  ],
  'U.S. Virgin Islands': [
    'Three main Caribbean islands—Saint Thomas, Saint John, and Saint Croix—feature lush hills and coral reefs.',
    'Sea turtles graze on seagrass beds inside protected national park bays.',
  ],
  Uzbekistan: [
    'Bright turquoise-tiled domes and ancient Silk Road marketplaces sparkle in Samarkand and Bukhara!',
    'Bactrian camels once carried silk and spices across Uzbekistan’s deserts.',
  ],
  Vanuatu: [
    'Vanuatu is a chain of 80 tropical islands where you can peer safely at glowing Mount Yasur volcano!',
    'It even has the world’s only underwater post office where divers mail waterproof postcards.',
  ],
  'Vatican City': [
    'Vatican City is the smallest country in the entire world—you can walk across it in just 15 minutes!',
    'It sits right inside the city of Rome in Italy.',
  ],
  Venezuela: [
    'Angel Falls in Venezuela is the tallest waterfall in the world—water drops nearly a whole kilometer from a flat-top mountain!',
    'Flat-topped table mountains called tepuis rise out of the jungle like islands in the sky.',
  ],
  Vietnam: [
    'Thousands of tall emerald limestone islands tower out of misty green water in Vietnam’s Ha Long Bay!',
    'Hang Son Doong in Vietnam is the largest cave passage on Earth—big enough to hold its own jungle and clouds.',
  ],
  'Wallis and Futuna': [
    'These lush volcanic islands sit in the South Pacific surrounded by calm coral lagoons.',
    'Coconut palms and tropical breadfruit trees shade quiet coastal villages.',
  ],
  'Western Sahara': [
    'Golden Sahara sand dunes meet crisp Atlantic Ocean waves along Western Sahara’s coast.',
    'Cool ocean breezes bring coastal mist to desert cliffs.',
  ],
  Yemen: [
    'Socotra Island off Yemen has amazing umbrella-shaped Dragon’s Blood trees found nowhere else on Earth!',
    'Ancient mud-brick "skyscrapers" in Shibam rise many stories high in the desert valley.',
  ],
  Zambia: [
    'Victoria Falls—called Mosi-oa-Tunya, "The Smoke That Thunders"—roars along Zambia’s border with Zimbabwe!',
    'Hippos and elephants gather along the winding Zambezi River.',
  ],
  Zimbabwe: [
    'Victoria Falls sends a giant cloud of rainbow mist high above the Zambezi River in Zimbabwe!',
    'Balancing granite boulders stack naturally like giant stone sculptures across Matobo Hills.',
  ],
  'Siachen Glacier': [
    'The Siachen Glacier sits high in the icy Karakoram mountains—one of the longest mountain glaciers outside the polar regions!',
    'Snowy peaks towering over 7,000 meters surround this frozen valley.',
  ],
  'N. Cyprus': [
    'The rugged Five Finger Mountains overlook sandy bays and medieval hilltop castles along northern Cyprus.',
    'Sea turtles nest on golden beaches here every summer.',
  ],
};

export function getRandomCountryFact(
  country: CountryFeature,
  continent?: ContinentConfig | null,
  excludeFact?: string | null,
): string {
  const name = country.properties.n;
  const curated = COUNTRY_FACTS[name];

  const pool =
    curated && curated.length > 0
      ? curated
      : [
          `${name} is located in ${continent?.name ?? 'our amazing world'}${country.properties.k ? `, with ${country.properties.k} as its capital city` : ''}.`,
          `From high above Earth, you can explore ${name}'s unique shape and neighboring places!`,
        ];

  const candidates =
    excludeFact && pool.length > 1
      ? pool.filter((fact) => fact !== excludeFact)
      : pool;

  return candidates[Math.floor(Math.random() * candidates.length)];
}
