Created At: 2026-06-13T12:57:48Z
Completed At: 2026-06-13T12:57:48Z
File Path: `file:///C:/Users/Nikhi/.gemini/antigravity/scratch/bible-quiz-app/js/db.js`
Total Lines: 799
Total Bytes: 38024
Showing lines 1 to 200
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
1: /**
2:  * Igniter Team - Bible Memorization Competition Database Layer
3:  * Offline-first localStorage adapter simulating Supabase/Firebase interfaces
4:  */
5: 
6: const DB_KEY = 'bible_quiz_db_state';
7: const INITIAL_DATA = {
8:     illakas: [
9:         { id: 'i1', name_ne: 'इलाका १ - धरान', name_en: 'Area 1 - Dharan' },
10:         { id: 'i2', name_ne: 'इलाका २ - इटहरी', name_en: 'Area 2 - Itahari' },
11:         { id: 'i3', name_ne: 'इलाका ३ - विराटनगर', name_en: 'Area 3 - Biratnagar' },
12:         { id: 'i4', name_ne: 'इलाका ४ - इनरुवा', name_en: 'Area 4 - Inaruwa' }
13:     ],
14:     score_categories: [
15:         { id: 'c1', name_ne: 'शुद्धता (Accuracy)', name_en: 'Accuracy', max_marks: 30 },
16:         { id: 'c2', name_ne: 'गति (Speed)', name_en: 'Speed', max_marks: 20 },
17:         { id: 'c3', name_ne: 'उच्चारण (Pronunciation)', name_en: 'Pronunciation', max_marks: 20 },
18:         { id: 'c4', name_ne: 'आत्मविश्वास (Confidence)', name_en: 'Confidence', max_marks: 15 },
19:         { id: 'c5', name_ne: 'कण्ठस्थ स्तर (Memorization Level)', name_en: 'Memorization Level', max_marks: 15 }
20:     ],
21:     participants: [
22:         {
23:             id: 'p1',
24:             name_ne: 'अभिषेक राई',
25:             church_name: 'बेथेल एसेम्बली चर्च, धरान',
26:             illaka_id: 'i1',
27:             age_group: 'युवा (Youth)',
28:             photo_url: '',
29:             attended: true,
30:             created_at: new Date(Date.now() - 36000000).toISOString()
31:         },
32:         {
33:             id: 'p2',
34:             name_ne: 'प्रशंसा श्रेष्ठ',
35:             church_name: 'सियोन चर्च, इटहरी',
36:             illaka_id: 'i2',
37:             age_group: 'किशोर (Teenagers)',
38:             photo_url: '',
39:             attended: true,
40:             created_at: new Date(Date.now() - 32000000).toISOString()
41:         },
42:         {
43:             id: 'p3',
44:             name_ne: 'सुवास तामाङ',
45:             church_name: 'एमानुएल चर्च, विराटनगर',
46:             illaka_id: 'i3',
47:             age_group: 'वयस्क (Adult)',
48:             photo_url: '',
49:             attended: true,
50:             created_at: new Date(Date.now() - 28000000).toISOString()
51:         },
52:         {
53:             id: 'p4',
54:             name_ne: 'एस्तर गुरुङ',
55:             church_name: 'कृपा मण्डली, धरान',
56:             illaka_id: 'i1',
57:             age_group: 'युवा (Youth)',
58:             photo_url: '',
59:             attended: true,
60:             created_at: new Date(Date.now() - 24000000).toISOString()
61:         },
62:         {
63:             id: 'p5',
64:             name_ne: 'सामुएल लिम्बु',
65:             church_name: 'जीवन ज्योति चर्च, इनरुवा',
66:             illaka_id: 'i4',
67:             age_group: 'किशोर (Teenagers)',
68:             photo_url: '',
69:             attended: false,
70:             created_at: new Date(Date.now() - 20000000).toISOString()
71:         },
72:         {
73:             id: 'p6',
74:             name_ne: 'कृपा नेपाली',
75:             church_name: 'फिलिप्पी मण्डली, इटहरी',
76:             illaka_id: 'i2',
77:             age_group: 'वयस्क (Adult)',
78:             photo_url: '',
79:             attended: true,
80:             created_at: new Date(Date.now() - 16000000).toISOString()
81:         }
82:     ],
83:     scores: [
84:         // Abhishek Rai scores (Total: 88)
85:         { id: 's1', participant_id: 'p1', category_id: 'c1', judge_name: 'पास्टर प्रकाश लिम्बु', marks_obtained: 27, comments: 'अति राम्रो कण्ठस्थ' },
86:         { id: 's2', participant_id: 'p1', category_id: 'c2', judge_name: 'पास्टर प्रकाश लिम्बु', marks_obtained: 18, comments: '' },
87:         { id: 's3', participant_id: 'p1', category_id: 'c3', judge_name: 'पास्टर प्रकाश लिम्बु', marks_obtained: 17, comments: '' },
88:         { id: 's4', participant_id: 'p1', category_id: 'c4', judge_name: 'पास्टर प्रकाश लिम्बु', marks_obtained: 13, comments: '' },
89:         { id: 's5', participant_id: 'p1', category_id: 'c5', judge_name: 'पास्टर प्रकाश लिम्बु', marks_obtained: 13, comments: '' },
90: 
91:         // Prasamsa Shrestha scores (Total: 93)
92:         { id: 's6', participant_id: 'p2', category_id: 'c1', judge_name: 'एलिस राई', marks_obtained: 29, comments: 'उत्कृष्ट शुद्धता!' },
93:         { id: 's7', participant_id: 'p2', category_id: 'c2', judge_name: 'एलिस राई', marks_obtained: 19, comments: '' },
94:         { id: 's8', participant_id: 'p2', category_id: 'c3', judge_name: 'एलिस राई', marks_obtained: 18, comments: '' },
95:         { id: 's9', participant_id: 'p2', category_id: 'c4', judge_name: 'एलिस राई', marks_obtained: 14, comments: '' },
96:         { id: 's10', participant_id: 'p2', category_id: 'c5', judge_name: 'एलिस राई', marks_obtained: 13, comments: '' },
97: 
98:         // Subas Tamang scores (Total: 79)
99:         { id: 's11', participant_id: 'p3', category_id: 'c1', judge_name: 'एलिस राई', marks_obtained: 22, comments: 'राम्रो प्रयास' },
100:         { id: 's12', participant_id: 'p3', category_id: 'c2', judge_name: 'एलिस राई', marks_obtained: 16, comments: '' },
101:         { id: 's13', participant_id: 'p3', category_id: 'c3', judge_name: 'एलिस राई', marks_obtained: 16, comments: '' },
102:         { id: 's14', participant_id: 'p3', category_id: 'c4', judge_name: 'एलिस राई', marks_obtained: 12, comments: '' },
103:         { id: 's15', participant_id: 'p3', category_id: 'c5', judge_name: 'एलिस राई', marks_obtained: 13, comments: '' },
104: 
105:         // Kripa Nepali scores (Total: 84)
106:         { id: 's16', participant_id: 'p6', category_id: 'c1', judge_name: 'पास्टर प्रकाश लिम्बु', marks_obtained: 25, comments: 'मध्यम गति' },
107:         { id: 's17', participant_id: 'p6', category_id: 'c2', judge_name: 'पास्टर प्रकाश लिम्बु', marks_obtained: 17, comments: '' },
108:         { id: 's18', participant_id: 'p6', category_id: 'c3', judge_name: 'पास्टर प्रकाश लिम्बु', marks_obtained: 16, comments: '' },
109:         { id: 's19', participant_id: 'p6', category_id: 'c4', judge_name: 'पास्टर प्रकाश लिम्बु', marks_obtained: 13, comments: '' },
110:         { id: 's20', participant_id: 'p6', category_id: 'c5', judge_name: 'पास्टर प्रकाश लिम्बु', marks_obtained: 13, comments: '' }
111:     ],
112:     notices: [
113:         { id: 'n1', title_ne: 'प्रतियोगिताको नयाँ नियमावली प्रकाशित गरिएको छ।', content_ne: 'सबै सहभागीहरूले नियमहरू ध्यानपूर्वक पढ्नुहोला।', is_ticker: true, created_at: new Date().toISOString() },
114:         { id: 'n2', title_ne: 'उद्घाटन समारोह बिहान ठीक ९:०० बजे सुरु हुनेछ।', content_ne: 'कृपया समयमै मण्डली हलमा उपस्थित हुनुहोला।', is_ticker: true, created_at: new Date().toISOString() },
115:         { id: 'n3', title_ne: 'विजेता घोषणा र प्रमाणपत्र वितरण बेलुकी ५:०० बजे हुनेछ।', content_ne: 'मुख्य अतिथिको हातबाट पुरस्कार वितरण गरिनेछ।', is_ticker: false, created_at: new Date().toISOString() }
116:     ],
117:     materials: [
118:         { id: 'm1', title_ne: 'प्रतियोगिता नियम र निर्देशिका २०२६ (PDF)', file_type: 'PDF', file_size: '1.2 MB', file_url: '#' },
119:         { id: 'm2', title_ne: 'प्रतिस्पर्धाको पूर्ण कार्यतालिका (Schedule Image)', file_type: 'Image', file_size: '850 KB', file_url: '#' },
120:         { id: 'm3', title_ne: 'कण्ठस्थ गर्नुपर्ने मुख्य बाइबल खण्डहरू (Text)', file_type: 'DOC', file_size: '140 KB', file_url: '#' }
121:     ],
122:     event_settings: {
123:         title_ne: 'बाइबल पद कण्ठस्थ प्रतियोगिता २०८३',
124:         subtitle_ne: 'इग्नाइटर टिम (Igniter Team)',
125:         event_date: new Date(Date.now() + 10 * 3600 * 1000 * 24).toISOString(), // 10 days in future
126:         event_time: 'बिहान ९:०० बजे (09:00 AM)',
127:         event_address: 'बेथेल एसेम्बली चर्च, धरान',
128:         event_church_image: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1200&q=80',
129:         event_location_map: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3566.24151591522!2d87.2798835!3d26.8049615!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ef4175b6e4e3bd%3A0x673a3dfef0b904c0!2sBethel%20Assembly%20Church!5e0!3m2!1sen!2snp!4v1717502283020!5m2!1sen!2snp',
130:         lock_scores: false,
131:         dashboard_visible: true,
132:         active_round_id: 'r1'
133:     },
134:     rounds: [
135:         { id: 'r1', name: 'पहिलो चरण (First Round)' },
136:         { id: 'r2', name: 'सेमी-फाइनल (Semi-Final)' },
137:         { id: 'r3', name: 'फाइनल (Final)' }
138:     ],
139:     certificate_settings: {
140:         title_ne: 'प्रशंसा-पत्र',
141:         title_en: 'Certificate of Appreciation',
142:         description_ne: 'लाई इग्नाइटर टिमद्वारा आयोजित "बाइबल पद कण्ठस्थ प्रतियोगिता २०८३" मा कुल अंक {score} प्राप्त गरी {rank} स्थान हासिल गर्नुभएकोमा उहाँको अथक प्रयास र बाइबल कण्ठस्थको उच्च सम्मान गर्दै यो प्रमाणपत्र प्रदान गरिएको छ।',
143:         description_en: 'is proudly awarded this certificate for successfully competing in the "Bible Memorization Contest 2026" organized by Igniter Team, scoring a total of {score} marks and achieving the {rank} rank. In recognition of their outstanding dedication and memorization excellence.',
144:         verse_ne: '"तपाईंको वचन मेरो खुट्टाको निम्ति बत्ती र मेरो बाटोको निम्ति उज्यालो हो।" - भजनसंग्रह ११९:१०५',
145:         verse_en: '"Your word is a lamp for my feet, a light on my path." - Psalm 119:105',
146:         signatories: [
147:             { id: 'sig1', name: 'Pst. Prakash Limbu', title_ne: 'मुख्य निर्णायक (Chief Judge)', title_en: 'Chief Judge', signature_url: '' },
148:             { id: 'sig2', name: 'Nikhil Sharma', title_ne: 'संयोजक (Coordinator)', title_en: 'Coordinator', signature_url: '' }
149:         ],
150:         theme_color: '#0a3064' // Default brand royal blue
151:     },
152:     prizes: [
153:         { id: 'pz1', title_ne: 'प्रथम पुरस्कार (1st Prize)', amount: 'रु. १०,००० /-', description_ne: 'नगद तथा ट्रफी' },
154:         { id: 'pz2', title_ne: 'द्वितीय पुरस्कार (2nd Prize)', amount: 'रु. ५,००० /-', description_ne: 'नगद तथा ट्रफी' },
155:         { id: 'pz3', title_ne: 'तृतीय पुरस्कार (3rd Prize)', amount: 'रु. ३,००० /-', description_ne: 'नगद तथा ट्रफी' },
156:         { id: 'pz4', title_ne: 'सान्त्वना पुरस्कार (Consolation)', amount: 'रु. १,००० /-', description_ne: 'नगद तथा प्रमाणपत्र' }
157:     ],
158:     auth_settings: {
159:         admin_pass: 'admin123',
160:         admin_recovery_email: '',
161:         judge_pass: 'judge123',
162:         judge_recovery_email: ''
163:     },
164:     gallery: [
165:         { id: 'g1', title_ne: 'Igniter Team working in 2023', image_url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=80', order: 1 },
166:         { id: 'g2', title_ne: 'Bible Quiz Event 2025', image_url: 'https://images.unsplash.com/photo-1511649475669-e288648b2339?auto=format&fit=crop&w=800&q=80', order: 2 }
167:     ],
168:     team_members: [
169:         { id: 't1', name: 'Nikhil Sharma', role: 'Coordinator & Lead Developer', photo_url: '', order: 1, group: 'top' },
170:         { id: 't2', name: 'Pst. Prakash Limbu', role: 'Chief Advisor', photo_url: '', order: 2, group: 'top' }
171:     ],
172:     contact_settings: {
173:         address: 'Kathmandu, Nepal',
174:         phone: '+977 9800000000',
175:         email: 'info@igniterteam.org',
176:         google_map_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d113032.64621396606!2d85.25005527299307!3d27.708942726359553!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb198a307baabf%3A0xb5137c1bf18db1ea!2sKathmandu%2044600!5e0!3m2!1sen!2snp!4v1717240324869!5m2!1sen!2snp'
177:     },
178:     messages: [] // Contact form submissions
179: };
180: 
181: class LocalDatabase {
182:     constructor() {
183:         this.load();
184:     }
185: 
186:     load() {
187:         try {
188:             const dataStr = localStorage.getItem(DB_KEY);
189:             if (dataStr) {
190:                 this.state = JSON.parse(dataStr);
191:                 // Ensure all fields exist
192:                 this.state = { ...INITIAL_DATA, ...this.state };
193:                 
194:                 // Auto-fix spelling mistakes if they are cached in localStorage
195:                 if (this.state.event_settings) {
196:                     if (!this.state.event_settings.event_time) this.state.event_settings.event_time = 'बिहान ९:०० बजे (09:00 AM)';
197:                     if (!this.state.event_settings.event_address) this.state.event_settings.event_address = 'बेथेल एसेम्बली चर्च, धरान';
198:                     if (!this.state.event_settings.event_church_image) this.state.event_settings.event_church_image = 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1200&q=80';
199:                     if (!this.state.event_settings.event_location_map) this.state.event_settings.event_location_map = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3566.24151591522!2d87.2798835!3d26.8049615!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ef4175b6e4e3bd%3A0x673a3dfef0b904c0!2sBethel%20Assembly%20Church!5e0!3m2!1sen!2snp!4v1717502283020!5m2!1sen!2snp';
200:                     if (!this.state.event_settings.active_round_id) this.state.event_settings.active_round_id = 'r1';
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.

