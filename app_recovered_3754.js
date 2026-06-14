Created At: 2026-06-13T12:43:39Z
Completed At: 2026-06-13T12:43:40Z
File Path: `file:///C:/Users/Nikhi/.gemini/antigravity/scratch/bible-quiz-app/js/app.js`
Total Lines: 1936
Total Bytes: 104590
Showing lines 1 to 250
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
1: /**
2:  * Igniter Team - Bible Memorization Competition Public View Controller
3:  * Manages SPA navigation, Widgets, Countdown, Search Filters, Notice Ticker & Theme Toggles
4:  */
5: 
6: document.addEventListener('DOMContentLoaded', () => {
7:     // 1. Theme Configuration
8:     const themeToggle = document.getElementById('theme-toggle');
9:     const savedTheme = localStorage.getItem('theme') || 'light';
10:     
11:     document.documentElement.setAttribute('data-theme', savedTheme);
12:     if (themeToggle) {
13:         themeToggle.checked = savedTheme === 'dark';
14:         themeToggle.addEventListener('change', (e) => {
15:             const theme = e.target.checked ? 'dark' : 'light';
16:             document.documentElement.setAttribute('data-theme', theme);
17:             localStorage.setItem('theme', theme);
18:             showToast(theme === 'dark' ? 'डार्क मोड सक्रिय भयो' : 'लाइट मोड सक्रिय भयो');
19:         });
20:     }
21: 
22:     // 1.5. Bilingual i18n Translation Configuration
23:     const langSelect = document.getElementById('lang-select');
24:     const savedLang = localStorage.getItem('lang') || 'ne';
25:     localStorage.setItem('lang', savedLang);
26:     
27:     const TRANSLATIONS = {
28:         ne: {
29:             // Header tabs
30:             'nav-org-home': '🏠 गृहपृष्ठ',
31:             'nav-about': '📖 हाम्रो बारेमा (About Us)',
32:             'nav-tournament-group': '🏆 प्रतियोगिता ▾',
33:             'nav-home': 'ड्यासबोर्ड',
34:             'nav-live-score': 'लाइभ नतिजा',
35:             'nav-participants': 'सहभागीहरू',
36:             'nav-downloads': 'डाउनलोडहरू',
37:             'nav-notices': '🔔 समाचार',
38:             'nav-gallery': '🖼️ ग्यालरी',
39:             'nav-contact': '📞 सम्पर्क',
40:             'nav-judge': '📝 जज प्यानल',
41:             'nav-admin': '⚙️ एडमिन प्यानल',
42:             'nav-login': '🔑 लगइन',
43:             'logout-btn': '🚪 बाहिरिनुहोस्',
44:             
45:             // Countdown section
46:             'countdown-title': 'प्रतियोगिता सुरु हुन बाँकी समय',
47:             'home-event-title': 'बाइबल पद कण्ठस्थ प्रतियोगिता २०८३',
48:             'home-event-subtitle': 'इग्नाइटर टिम (Igniter Team)',
49:             
50:             // System roles
51:             'role-viewer': 'दर्शक (Viewer)',
52:             'role-judge': 'निर्णायक (Judge)',
53:             'role-admin': 'सुपर एडमिन'
54:         },
55:         en: {
56:             // Header tabs
57:             'nav-org-home': '🏠 Home',
58:             'nav-about': '📖 About Us',
59:             'nav-tournament-group': '🏆 Tournament ▾',
60:             'nav-home': 'Dashboard',
61:             'nav-live-score': 'Live Result',
62:             'nav-participants': 'Participants',
63:             'nav-downloads': 'Downloads',
64:             'nav-notices': '🔔 News',
65:             'nav-gallery': '🖼️ Gallery',
66:             'nav-contact': '📞 Contact',
67:             'nav-judge': '📝 Judge Panel',
68:             'nav-admin': '⚙️ Admin Panel',
69:             'nav-login': '🔑 Login',
70:             'logout-btn': '🚪 Logout',
71:             
72:             // Countdown section
73:             'countdown-title': 'Time Remaining Until Competition Starts',
74:             'home-event-title': 'Bible Reading Memorization Contest 2026',
75:             'home-event-subtitle': 'Igniter Team • Into the Way of Jesus Christ',
76:             
77:             // System roles
78:             'role-viewer': 'Viewer (दर्शक)',
79:             'role-judge': 'Judge (निर्णायक)',
80:             'role-admin': 'Super Admin'
81:         }
82:     };
83: 
84:     window.translateUI = function(lang) {
85:         const dict = TRANSLATIONS[lang] || TRANSLATIONS['ne'];
86:         
87:         // Translate direct ID mappings
88:         Object.keys(dict).forEach(id => {
89:             const el = document.getElementById(id);
90:             if (el) el.textContent = dict[id];
91:         });
92: 
93:         // Toggle locale attributes
94:         document.documentElement.lang = lang;
95:         document.title = lang === 'en' ? 'Bible Memorization Contest - Igniter Team' : 'बाइबल पद कण्ठस्थ प्रतियोगिता - इग्नाइटर टिम';
96: 
97:         // Translate countdown boxes labels
98:         const labels = document.querySelectorAll('.countdown-label');
99:         if (labels.length >= 4) {
100:             labels[0].textContent = lang === 'en' ? 'Days' : 'दिन';
101:             labels[1].textContent = lang === 'en' ? 'Hours' : 'घण्टा';
102:             labels[2].textContent = lang === 'en' ? 'Minutes' : 'मिनेट';
103:             labels[3].textContent = lang === 'en' ? 'Seconds' : 'सेकेन्ड';
104:         }
105: 
106:         // Translate Stats Widgets
107:         const widgetTitles = document.querySelectorAll('.widget-title');
108:         const widgetDescs = document.querySelectorAll('.widget-desc');
109:         
110:         if (widgetTitles.length >= 3) {
111:             widgetTitles[0].textContent = lang === 'en' ? 'Total Participants' : 'कुल सहभागीहरू (Total Participants)';
112:             widgetTitles[1].textContent = lang === 'en' ? 'Total Regions (Illaka)' : 'सम्बद्ध इलाकाहरू (Total Regions)';
113:             widgetTitles[2].textContent = lang === 'en' ? 'Top Scorer Competitor' : 'सर्वोत्कृष्ट प्रतियोगी (Top Scorer)';
114:         }
115:         
116:         if (widgetDescs.length >= 3) {
117:             widgetDescs[0].textContent = lang === 'en' ? 'Competitors registered in the tournament' : 'प्रतियोगितामा दर्ता भएका जम्मा प्रतिस्पर्धी';
118:             widgetDescs[1].textContent = lang === 'en' ? '4 regions and newly added areas' : '४ इलाकाहरू र थप नयाँ क्षेत्रहरू';
119:             
120:             const ranked = window.db.getRankedParticipants();
121:             if (ranked.length === 0) {
122:                 widgetDescs[2].textContent = lang === 'en' ? 'Not evaluated yet' : 'अझै मूल्याङ्कन भएको छैन';
123:             }
124:         }
125: 
126:         // Translate Section Titles (Dashboard Home)
127:         const top3LeaderTitle = document.getElementById('top-3-leaderboard')?.previousElementSibling;
128:         if (top3LeaderTitle) {
129:             top3LeaderTitle.textContent = lang === 'en' ? '🏆 Top 3 Leaderboard' : '🏆 शीर्ष ३ विजेताहरू (Top 3 Leaderboard)';
130:         }
131: 
132:         const recentNoticesTitle = document.getElementById('recent-notices-container')?.previousElementSibling;
133:         if (recentNoticesTitle) {
134:             recentNoticesTitle.textContent = lang === 'en' ? '📢 Recent Notices & Updates' : '📢 भर्खरैका सूचनाहरू (Recent Updates)';
135:         }
136: 
137:         // Translate Live Score Section
138:         const liveScoreHeader = document.querySelector('#section-live-score .action-row h2');
139:         if (liveScoreHeader) {
140:             liveScoreHeader.textContent = lang === 'en' ? 'Live Scoreboard & Ranks' : 'लाइभ स्कोरबोर्ड र श्रेणीकरण (Live Rankings)';
141:         }
142: 
143:         const btnExport = document.querySelector('#section-live-score .action-row button[onclick*="exportLiveScores"]');
144:         if (btnExport) {
145:             btnExport.textContent = lang === 'en' ? '📊 Export Excel/CSV' : '📊 Excel/CSV डाउनलोड';
146:         }
147: 
148:         const btnPrint = document.querySelector('#section-live-score .action-row button[onclick*="print"]');
149:         if (btnPrint) {
150:             btnPrint.textContent = lang === 'en' ? '🖨️ Print Results Table' : '🖨️ नतिजा प्रिन्ट गर्नुहोस्';
151:         }
152: 
153:         // Translate table headers
154:         const tableThs = document.querySelectorAll('#section-live-score table th');
155:         if (tableThs.length >= 7) {
156:             tableThs[0].textContent = lang === 'en' ? 'Rank (स्थान)' : 'स्थान (Rank)';
157:             tableThs[1].textContent = lang === 'en' ? 'Competitor Name' : 'सहभागीको नाम (Name)';
158:             tableThs[2].textContent = lang === 'en' ? 'Church' : 'मण्डली (Church)';
159:             tableThs[3].textContent = lang === 'en' ? 'Region (Illaka)' : 'इलाका (Area)';
160:             tableThs[4].textContent = lang === 'en' ? 'Score Categories Breakdown' : 'श्रेणीगत अंक (Score Categories Breakdown)';
161:             tableThs[5].textContent = lang === 'en' ? 'Total Marks' : 'कुल प्राप्त अंक (Total)';
162:             tableThs[6].textContent = lang === 'en' ? 'Action' : 'कार्य (Action)';
163:         }
164: 
165:         // Translate Search & Filters
166:         const searchInput = document.getElementById('p-search-input');
167:         if (searchInput) {
168:             searchInput.placeholder = lang === 'en' ? '🔍 Search competitor name or church...' : '🔍 सहभागीको नाम वा मण्डलीबाट खोज्नुहोस्...';
169:         }
170: 
171:         const illakaFilter = document.getElementById('p-filter-illaka');
172:         if (illakaFilter && illakaFilter.options.length > 0) {
173:             illakaFilter.options[0].textContent = lang === 'en' ? 'All Areas (सबै इलाकाहरू)' : 'सबै इलाकाहरू (All Areas)';
174:         }
175: 
176:         const pListHeader = document.querySelector('#section-participants .action-row h2');
177:         if (pListHeader) {
178:             pListHeader.textContent = lang === 'en' ? 'Participants Directory' : 'प्रतिस्पर्धी सूची (Participants Directory)';
179:         }
180: 
181:         // Translate Downloads Section
182:         const dlHeader = document.querySelector('#section-downloads h2');
183:         if (dlHeader) {
184:             dlHeader.textContent = lang === 'en' ? '📥 Instruction Guidelines & Downloads' : '📥 निर्देशिका र सामग्री डाउनलोड (Downloads Section)';
185:         }
186:         const dlDesc = document.querySelector('#section-downloads p');
187:         if (dlDesc) {
188:             dlDesc.textContent = lang === 'en' ? 'Download competition rules, Bible chapters study materials, and event schedules here.' : 'प्रतियोगितासम्बन्धी नियमहरू, बाइबल खण्डहरू र कार्यतालिकाहरू यहाँबाट डाउनलोड गर्न सक्नुहुन्छ।';
189:         }
190: 
191:         // Translate Notice Section
192:         const nHeader = document.querySelector('#section-notices h2');
193:         if (nHeader) {
194:             nHeader.textContent = lang === 'en' ? '🔔 Official Notice Board' : '🔔 आधिकारिक सूचना बोर्ड (Notice Board)';
195:         }
196:         const nDesc = document.querySelector('#section-notices p');
197:         if (nDesc) {
198:             nDesc.textContent = lang === 'en' ? 'The latest official tournament updates, schedules, and decisions are published here.' : 'कार्यक्रमसम्बन्धी पछिल्ला निर्णय तथा सूचनाहरू यहाँ प्रकाशन गरिन्छ।';
199:         }
200: 
201:         // Translate Secure Login Card
202:         const loginHeader = document.querySelector('#section-login h2');
203:         if (loginHeader) {
204:             loginHeader.textContent = lang === 'en' ? 'Secure Portal Login' : 'सुरक्षित प्रणाली लगइन';
205:         }
206:         const loginSub = document.querySelector('#section-login p');
207:         if (loginSub) {
208:             loginSub.textContent = lang === 'en' ? 'Enter judge or administrator credentials' : 'एडमिन वा निर्णायक (Judge) विवरण प्रविष्ट गर्नुहोस्';
209:         }
210:         const loginLabels = document.querySelectorAll('#section-login .form-label');
211:         if (loginLabels.length >= 2) {
212:             loginLabels[0].textContent = lang === 'en' ? 'Username (युजरनेम):' : 'युजरनेम (Username):';
213:             loginLabels[1].textContent = lang === 'en' ? 'Password (पासवर्ड):' : 'पासवर्ड (Password):';
214:         }
215:         const btnLoginSubmit = document.querySelector('#login-form button');
216:         if (btnLoginSubmit) {
217:             btnLoginSubmit.textContent = lang === 'en' ? '🚪 Log In to Portal' : '🚪 प्रणालीमा प्रवेश गर्नुहोस्';
218:         }
219:         const loginHelp = document.querySelector('#section-login div p');
220:         if (loginHelp) {
221:             loginHelp.textContent = lang === 'en' ? '🔑 Testing Credentials:' : '🔑 परीक्षणका लागि साख विवरण (Credentials):';
222:         }
223: 
224:         // Translate Judge Portal Section
225:         const jHeader = document.querySelector('#section-judge .action-row h2');
226:         if (jHeader) {
227:             jHeader.textContent = lang === 'en' ? 'Judges Portal Score Sheet' : 'निर्णायक अंक प्रविष्टि तालिका (Judges Portal)';
228:         }
229:         const jSub = document.querySelector('#section-judge .action-row p');
230:         if (jSub) {
231:             jSub.textContent = lang === 'en' ? 'Select a competitor below to input score evaluations.' : 'सहभागी चयन गरी तत्काल श्रेणीगत अंक प्रविष्ट गर्नुहोस्।';
232:         }
233:         
234:         const judgeFilter = document.getElementById('judge-status-filter');
235:         if (judgeFilter && judgeFilter.options.length >= 3) {
236:             judgeFilter.options[0].textContent = lang === 'en' ? 'All Participants (सबै सहभागीहरू)' : 'सबै सहभागीहरू (All)';
237:             judgeFilter.options[1].textContent = lang === 'en' ? 'Pending Evaluation (बाँकी)' : 'मूल्यांकन बाँकी (Pending)';
238:             judgeFilter.options[2].textContent = lang === 'en' ? 'Evaluated (मूल्यांकन गरिएका)' : 'मूल्यांकन गरिएका (Evaluated)';
239:         }
240: 
241:         // Translate Admin Sidebar
242:         const adminHeader = document.querySelector('#section-admin .action-row h2');
243:         if (adminHeader) {
244:             adminHeader.textContent = lang === 'en' ? '⚙️ Control Center (Admin Panel)' : '⚙️ नियन्त्रण कक्ष (Admin Panel)';
245:         }
246:         
247:         const adminSubnavs = document.querySelectorAll('.admin-subnav-btn');
248:         if (adminSubnavs.length >= 5) {
249:             adminSubnavs[0].textContent = lang === 'en' ? '👥 Competitors (सहभागी)' : '👥 सहभागी व्यवस्थापन';
250:             adminSubnavs[1].textContent = lang === 'en' ? '📍 Regions (इलाका)' : '📍 इलाका व्यवस्थापन';
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
