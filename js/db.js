/**
 * Igniter Team - Bible Memorization Competition Database Layer
 * Offline-first localStorage adapter simulating Supabase/Firebase interfaces
 */

const DB_KEY = 'bible_quiz_db_state';
const INITIAL_DATA = {
    illakas: [
        { id: 'i1', name_ne: 'इलाका १ - धरान', name_en: 'Area 1 - Dharan' },
        { id: 'i2', name_ne: 'इलाका २ - इटहरी', name_en: 'Area 2 - Itahari' },
        { id: 'i3', name_ne: 'इलाका ३ - विराटनगर', name_en: 'Area 3 - Biratnagar' },
        { id: 'i4', name_ne: 'इलाका ४ - इनरुवा', name_en: 'Area 4 - Inaruwa' }
    ],
    score_categories: [
        { id: 'c1', name_ne: 'शुद्धता (Accuracy)', name_en: 'Accuracy', max_marks: 30 },
        { id: 'c2', name_ne: 'गति (Speed)', name_en: 'Speed', max_marks: 20 },
        { id: 'c3', name_ne: 'उच्चारण (Pronunciation)', name_en: 'Pronunciation', max_marks: 20 },
        { id: 'c4', name_ne: 'आत्मविश्वास (Confidence)', name_en: 'Confidence', max_marks: 15 },
        { id: 'c5', name_ne: 'कण्ठस्थ स्तर (Memorization Level)', name_en: 'Memorization Level', max_marks: 15 }
    ],
    participants: [
        {
            id: 'p1',
            name_ne: 'अभिषेक राई',
            church_name: 'बेथेल एसेम्बली चर्च, धरान',
            illaka_id: 'i1',
            age_group: 'युवा (Youth)',
            photo_url: '',
            attended: true,
            created_at: new Date(Date.now() - 36000000).toISOString()
        },
        {
            id: 'p2',
            name_ne: 'प्रशंसा श्रेष्ठ',
            church_name: 'सियोन चर्च, इटहरी',
            illaka_id: 'i2',
            age_group: 'किशोर (Teenagers)',
            photo_url: '',
            attended: true,
            created_at: new Date(Date.now() - 32000000).toISOString()
        },
        {
            id: 'p3',
            name_ne: 'सुवास तामाङ',
            church_name: 'एमानुएल चर्च, विराटनगर',
            illaka_id: 'i3',
            age_group: 'वयस्क (Adult)',
            photo_url: '',
            attended: true,
            created_at: new Date(Date.now() - 28000000).toISOString()
        },
        {
            id: 'p4',
            name_ne: 'एस्तर गुरुङ',
            church_name: 'कृपा मण्डली, धरान',
            illaka_id: 'i1',
            age_group: 'युवा (Youth)',
            photo_url: '',
            attended: true,
            created_at: new Date(Date.now() - 24000000).toISOString()
        },
        {
            id: 'p5',
            name_ne: 'सामुएल लिम्बु',
            church_name: 'जीवन ज्योति चर्च, इनरुवा',
            illaka_id: 'i4',
            age_group: 'किशोर (Teenagers)',
            photo_url: '',
            attended: false,
            created_at: new Date(Date.now() - 20000000).toISOString()
        },
        {
            id: 'p6',
            name_ne: 'कृपा नेपाली',
            church_name: 'फिलिप्पी मण्डली, इटहरी',
            illaka_id: 'i2',
            age_group: 'वयस्क (Adult)',
            photo_url: '',
            attended: true,
            created_at: new Date(Date.now() - 16000000).toISOString()
        }
    ],
    scores: [
        // Abhishek Rai scores (Total: 88)
        { id: 's1', participant_id: 'p1', category_id: 'c1', judge_name: 'पास्टर प्रकाश लिम्बु', marks_obtained: 27, comments: 'अति राम्रो कण्ठस्थ' },
        { id: 's2', participant_id: 'p1', category_id: 'c2', judge_name: 'पास्टर प्रकाश लिम्बु', marks_obtained: 18, comments: '' },
        { id: 's3', participant_id: 'p1', category_id: 'c3', judge_name: 'पास्टर प्रकाश लिम्बु', marks_obtained: 17, comments: '' },
        { id: 's4', participant_id: 'p1', category_id: 'c4', judge_name: 'पास्टर प्रकाश लिम्बु', marks_obtained: 13, comments: '' },
        { id: 's5', participant_id: 'p1', category_id: 'c5', judge_name: 'पास्टर प्रकाश लिम्बु', marks_obtained: 13, comments: '' },

        // Prasamsa Shrestha scores (Total: 93)
        { id: 's6', participant_id: 'p2', category_id: 'c1', judge_name: 'एलिस राई', marks_obtained: 29, comments: 'उत्कृष्ट शुद्धता!' },
        { id: 's7', participant_id: 'p2', category_id: 'c2', judge_name: 'एलिस राई', marks_obtained: 19, comments: '' },
        { id: 's8', participant_id: 'p2', category_id: 'c3', judge_name: 'एलिस राई', marks_obtained: 18, comments: '' },
        { id: 's9', participant_id: 'p2', category_id: 'c4', judge_name: 'एलिस राई', marks_obtained: 14, comments: '' },
        { id: 's10', participant_id: 'p2', category_id: 'c5', judge_name: 'एलिस राई', marks_obtained: 13, comments: '' },

        // Subas Tamang scores (Total: 79)
        { id: 's11', participant_id: 'p3', category_id: 'c1', judge_name: 'एलिस राई', marks_obtained: 22, comments: 'राम्रो प्रयास' },
        { id: 's12', participant_id: 'p3', category_id: 'c2', judge_name: 'एलिस राई', marks_obtained: 16, comments: '' },
        { id: 's13', participant_id: 'p3', category_id: 'c3', judge_name: 'एलिस राई', marks_obtained: 16, comments: '' },
        { id: 's14', participant_id: 'p3', category_id: 'c4', judge_name: 'एलिस राई', marks_obtained: 12, comments: '' },
        { id: 's15', participant_id: 'p3', category_id: 'c5', judge_name: 'एलिस राई', marks_obtained: 13, comments: '' },

        // Kripa Nepali scores (Total: 84)
        { id: 's16', participant_id: 'p6', category_id: 'c1', judge_name: 'पास्टर प्रकाश लिम्बु', marks_obtained: 25, comments: 'मध्यम गति' },
        { id: 's17', participant_id: 'p6', category_id: 'c2', judge_name: 'पास्टर प्रकाश लिम्बु', marks_obtained: 17, comments: '' },
        { id: 's18', participant_id: 'p6', category_id: 'c3', judge_name: 'पास्टर प्रकाश लिम्बु', marks_obtained: 16, comments: '' },
        { id: 's19', participant_id: 'p6', category_id: 'c4', judge_name: 'पास्टर प्रकाश लिम्बु', marks_obtained: 13, comments: '' },
        { id: 's20', participant_id: 'p6', category_id: 'c5', judge_name: 'पास्टर प्रकाश लिम्बु', marks_obtained: 13, comments: '' }
    ],
    notices: [
        { id: 'n1', title_ne: 'प्रतियोगिताको नयाँ नियमावली प्रकाशित गरिएको छ।', content_ne: 'सबै सहभागीहरूले नियमहरू ध्यानपूर्वक पढ्नुहोला।', is_ticker: true, created_at: new Date().toISOString() },
        { id: 'n2', title_ne: 'उद्घाटन समारोह बिहान ठीक ९:०० बजे सुरु हुनेछ।', content_ne: 'कृपया समयमै मण्डली हलमा उपस्थित हुनुहोला।', is_ticker: true, created_at: new Date().toISOString() },
        { id: 'n3', title_ne: 'विजेता घोषणा र प्रमाणपत्र वितरण बेलुकी ५:०० बजे हुनेछ।', content_ne: 'मुख्य अतिथिको हातबाट पुरस्कार वितरण गरिनेछ।', is_ticker: false, created_at: new Date().toISOString() }
    ],
    materials: [
        { id: 'm1', title_ne: 'प्रतियोगिता नियम र निर्देशिका २०२६ (PDF)', file_type: 'PDF', file_size: '1.2 MB', file_url: '#' },
        { id: 'm2', title_ne: 'प्रतिस्पर्धाको पूर्ण कार्यतालिका (Schedule Image)', file_type: 'Image', file_size: '850 KB', file_url: '#' },
        { id: 'm3', title_ne: 'कण्ठस्थ गर्नुपर्ने मुख्य बाइबल खण्डहरू (Text)', file_type: 'DOC', file_size: '140 KB', file_url: '#' }
    ],
    event_settings: {
        title_ne: 'बाइबल पद कण्ठस्थ प्रतियोगिता २०८३',
        subtitle_ne: 'इग्नाइटर टिम (Igniter Team)',
        event_date: new Date(Date.now() + 10 * 3600 * 1000 * 24).toISOString(), // 10 days in future
        lock_scores: false,
        dashboard_visible: true
    },
    certificate_settings: {
        title_ne: 'प्रशंसा-पत्र',
        title_en: 'Certificate of Appreciation',
        description_ne: 'लाई इग्नाइटर टिमद्वारा आयोजित "बाइबल पद कण्ठस्थ प्रतियोगिता २०८३" मा कुल अंक {score} प्राप्त गरी {rank} स्थान हासिल गर्नुभएकोमा उहाँको अथक प्रयास र बाइबल कण्ठस्थको उच्च सम्मान गर्दै यो प्रमाणपत्र प्रदान गरिएको छ।',
        description_en: 'is proudly awarded this certificate for successfully competing in the "Bible Memorization Contest 2026" organized by Igniter Team, scoring a total of {score} marks and achieving the {rank} rank. In recognition of their outstanding dedication and memorization excellence.',
        verse_ne: '"तपाईंको वचन मेरो खुट्टाको निम्ति बत्ती र मेरो बाटोको निम्ति उज्यालो हो।" - भजनसंग्रह ११९:१०५',
        verse_en: '"Your word is a lamp for my feet, a light on my path." - Psalm 119:105',
        signatories: [
            { id: 'sig1', name: 'Pst. Prakash Limbu', title_ne: 'मुख्य निर्णायक (Chief Judge)', title_en: 'Chief Judge', signature_url: '' },
            { id: 'sig2', name: 'Nikhil Sharma', title_ne: 'संयोजक (Coordinator)', title_en: 'Coordinator', signature_url: '' }
        ],
        theme_color: '#0a3064' // Default brand royal blue
    },
    prizes: [
        { id: 'pz1', title_ne: 'प्रथम पुरस्कार (1st Prize)', amount: 'रु. १०,००० /-', description_ne: 'नगद तथा ट्रफी' },
        { id: 'pz2', title_ne: 'द्वितीय पुरस्कार (2nd Prize)', amount: 'रु. ५,००० /-', description_ne: 'नगद तथा ट्रफी' },
        { id: 'pz3', title_ne: 'तृतीय पुरस्कार (3rd Prize)', amount: 'रु. ३,००० /-', description_ne: 'नगद तथा ट्रफी' },
        { id: 'pz4', title_ne: 'सान्त्वना पुरस्कार (Consolation)', amount: 'रु. १,००० /-', description_ne: 'नगद तथा प्रमाणपत्र' }
    ],
    auth_settings: {
        admin_pass: 'admin123',
        admin_recovery_email: '',
        judge_pass: 'judge123',
        judge_recovery_email: ''
    },
    gallery: [
        { id: 'g1', title_ne: 'Igniter Team working in 2023', image_url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=80', order: 1 },
        { id: 'g2', title_ne: 'Bible Quiz Event 2025', image_url: 'https://images.unsplash.com/photo-1511649475669-e288648b2339?auto=format&fit=crop&w=800&q=80', order: 2 }
    ],
    team_members: [
        { id: 't1', name: 'Nikhil Sharma', role: 'Coordinator & Lead Developer', photo_url: '', order: 1 },
        { id: 't2', name: 'Pst. Prakash Limbu', role: 'Chief Advisor', photo_url: '', order: 2 }
    ],
    contact_settings: {
        address: 'Kathmandu, Nepal',
        phone: '+977 9800000000',
        email: 'info@igniterteam.org',
        google_map_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d113032.64621396606!2d85.25005527299307!3d27.708942726359553!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb198a307baabf%3A0xb5137c1bf18db1ea!2sKathmandu%2044600!5e0!3m2!1sen!2snp!4v1717240324869!5m2!1sen!2snp'
    },
    messages: [] // Contact form submissions
};

class LocalDatabase {
    constructor() {
        this.load();
    }

    load() {
        try {
            const dataStr = localStorage.getItem(DB_KEY);
            if (dataStr) {
                this.state = JSON.parse(dataStr);
                // Ensure all fields exist
                this.state = { ...INITIAL_DATA, ...this.state };
                
                // Auto-fix spelling mistakes if they are cached in localStorage
                if (this.state.event_settings) {
                    if (this.state.event_settings.title_ne.includes('पढ')) {
                        this.state.event_settings.title_ne = this.state.event_settings.title_ne.replace(/पढ/g, 'पद');
                    }
                    if (this.state.event_settings.title_ne.includes('कण्ठस्त')) {
                        this.state.event_settings.title_ne = this.state.event_settings.title_ne.replace(/कण्ठस्त/g, 'कण्ठस्थ');
                    }
                }
                if (this.state.certificate_settings && this.state.certificate_settings.description_ne) {
                    if (this.state.certificate_settings.description_ne.includes('पढ')) {
                        this.state.certificate_settings.description_ne = this.state.certificate_settings.description_ne.replace(/पढ/g, 'पद');
                    }
                    if (this.state.certificate_settings.description_ne.includes('कण्ठस्त')) {
                        this.state.certificate_settings.description_ne = this.state.certificate_settings.description_ne.replace(/कण्ठस्त/g, 'कण्ठस्थ');
                    }
                }
                
                // Self-healing database loader to prune invalid HTML page URLs
                let cleaned = false;
                if (this.state.certificate_settings) {
                    const cleanUrl = (url) => {
                        if (!url) return '';
                        if (url.includes('index.html') || url.startsWith('file://') || (url.startsWith('http') && !url.includes('google') && !url.includes('unsplash') && !url.includes('cloudinary') && !url.includes('via.placeholder') && !url.includes('data:image'))) {
                            cleaned = true;
                            return '';
                        }
                        return url;
                    };
                    
                    const origLogo = this.state.certificate_settings.logo_url;
                    const origWatermark = this.state.certificate_settings.watermark_url;
                    
                    this.state.certificate_settings.logo_url = cleanUrl(origLogo);
                    this.state.certificate_settings.watermark_url = cleanUrl(origWatermark);
                    
                    if (this.state.certificate_settings.signatories) {
                        this.state.certificate_settings.signatories.forEach(sig => {
                            const origSig = sig.signature_url;
                            sig.signature_url = cleanUrl(origSig);
                        });
                    }
                }
                if (cleaned) {
                    this.save();
                }
                
            } else {
                this.state = JSON.parse(JSON.stringify(INITIAL_DATA));
                this.save();
            }
        } catch (e) {
            console.error('Failed to load database state, using initial state:', e);
            this.state = JSON.parse(JSON.stringify(INITIAL_DATA));
        }
    }

    save() {
        try {
            localStorage.setItem(DB_KEY, JSON.stringify(this.state));
            // Notify other tabs on the same browser
            window.dispatchEvent(new Event('db_updated'));
            // Push to Firebase so ALL viewers get the update
            if (window.FirebaseSync) {
                window.FirebaseSync.pushToCloud(this.state);
            }
        } catch (e) {
            console.error('Database write error:', e);
        }
    }

    reset() {
        this.state = JSON.parse(JSON.stringify(INITIAL_DATA));
        this.save();
    }

    importBackup(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            if (imported.illakas && imported.participants && imported.score_categories && imported.scores) {
                this.state = imported;
                this.save();
                return true;
            }
            return false;
        } catch (e) {
            console.error('Backup restore failed', e);
            return false;
        }
    }

    exportBackup() {
        return JSON.stringify(this.state, null, 2);
    }

    // --- Illaka CRUD ---
    getIllakas() {
        return this.state.illakas;
    }

    getIllakaById(id) {
        return this.state.illakas.find(i => i.id === id);
    }

    saveIllaka(illaka) {
        if (illaka.id) {
            const index = this.state.illakas.findIndex(i => i.id === illaka.id);
            if (index !== -1) {
                this.state.illakas[index] = { ...this.state.illakas[index], ...illaka };
            }
        } else {
            illaka.id = 'i_' + Date.now();
            this.state.illakas.push(illaka);
        }
        this.save();
        return illaka;
    }

    deleteIllaka(id) {
        // Prevent deletion if participants are using it
        const used = this.state.participants.some(p => p.illaka_id === id);
        if (used) {
            throw new Error('यो इलाका हाल सहभागीहरूद्वारा प्रयोगमा रहेकोले मेटाउन सकिँदैन।');
        }
        this.state.illakas = this.state.illakas.filter(i => i.id !== id);
        this.save();
        return true;
    }

    // --- Participant CRUD ---
    getParticipants() {
        return this.state.participants;
    }

    getParticipantById(id) {
        return this.state.participants.find(p => p.id === id);
    }

    saveParticipant(participant) {
        // Ensure default eliminated flag if not set
        if (participant.eliminated === undefined) {
            participant.eliminated = false;
        }

        if (participant.id) {
            const index = this.state.participants.findIndex(p => p.id === participant.id);
            if (index !== -1) {
                this.state.participants[index] = { ...this.state.participants[index], ...participant };
            }
        } else {
            participant.id = 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
            participant.attended = participant.attended || false;
            participant.created_at = new Date().toISOString();
            this.state.participants.push(participant);
        }
        this.save();
        return participant;
    }

    deleteParticipant(id) {
        this.state.participants = this.state.participants.filter(p => p.id !== id);
        // Also delete their scores
        this.state.scores = this.state.scores.filter(s => s.participant_id !== id);
        this.save();
        return true;
    }

    // --- Scoring Category CRUD ---
    getScoreCategories() {
        return this.state.score_categories;
    }

    saveScoreCategory(category) {
        if (category.id) {
            const index = this.state.score_categories.findIndex(c => c.id === category.id);
            if (index !== -1) {
                this.state.score_categories[index] = { ...this.state.score_categories[index], ...category };
            }
        } else {
            category.id = 'c_' + Date.now();
            this.state.score_categories.push(category);
        }
        this.save();
        return category;
    }

    deleteScoreCategory(id) {
        this.state.score_categories = this.state.score_categories.filter(c => c.id !== id);
        // Also clean scores under this category
        this.state.scores = this.state.scores.filter(s => s.category_id !== id);
        this.save();
        return true;
    }

    // --- Score Input / Judge Panel ---
    getParticipantScores(participantId) {
        return this.state.scores.filter(s => s.participant_id === participantId);
    }

    saveParticipantScores(participantId, scoreEntries, judgeName) {
        if (this.state.event_settings.lock_scores) {
            throw new Error('अंक प्रविष्टि लक गरिएको छ। एडमिनसँग सम्पर्क राख्नुहोस्।');
        }
        // Remove existing scores by this judge for this participant
        this.state.scores = this.state.scores.filter(
            s => !(s.participant_id === participantId && s.judge_name === judgeName)
        );

        // Add new scores
        scoreEntries.forEach(entry => {
            this.state.scores.push({
                id: 's_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                participant_id: participantId,
                category_id: entry.category_id,
                judge_name: judgeName,
                marks_obtained: parseFloat(entry.marks_obtained),
                comments: entry.comments || ''
            });
        });

        // Set attendance to true as they are now evaluated
        const participant = this.getParticipantById(participantId);
        if (participant && !participant.attended) {
            participant.attended = true;
            this.saveParticipant(participant);
        }

        this.save();
    }

    // Clean all scores for a participant
    resetParticipantScores(participantId) {
        this.state.scores = this.state.scores.filter(s => s.participant_id !== participantId);
        this.save();
    }

    // --- Dynamic Analytics / Ranks / Leaderboard ---
    getRankedParticipants() {
        const categories = this.getScoreCategories();
        return this.state.participants.map(p => {
            const pScores = this.state.scores.filter(s => s.participant_id === p.id);
            
            // Group by judge to find averages if multiple judges evaluate
            const judges = [...new Set(pScores.map(s => s.judge_name))];
            
            let totalScore = 0;
            let scoreBreakdown = {};

            // Initialize categories in breakdown
            categories.forEach(c => {
                scoreBreakdown[c.id] = { marks: 0, count: 0 };
            });

            pScores.forEach(s => {
                if (scoreBreakdown[s.category_id]) {
                    scoreBreakdown[s.category_id].marks += s.marks_obtained;
                    scoreBreakdown[s.category_id].count += 1;
                }
            });

            // Calculate average for each category and sum them up
            let categoryAverages = {};
            categories.forEach(c => {
                const item = scoreBreakdown[c.id];
                const avg = item.count > 0 ? (item.marks / item.count) : 0;
                categoryAverages[c.id] = parseFloat(avg.toFixed(2));
                totalScore += avg;
            });

            const illaka = this.getIllakaById(p.illaka_id);
            const activeLang = localStorage.getItem('lang') || 'ne';

            return {
                ...p,
                illaka_name: illaka ? (activeLang === 'en' && illaka.name_en ? illaka.name_en : illaka.name_ne) : (activeLang === 'en' ? 'Unknown Area' : 'अज्ञात इलाका'),
                total_score: parseFloat(totalScore.toFixed(2)),
                category_averages: categoryAverages,
                evaluated: judges.length > 0,
                judge_count: judges.length,
                eliminated: !!p.eliminated
            };
        })
        .filter(p => p.attended || p.evaluated) // only display evaluated or present ones in live rankings
        .sort((a, b) => b.total_score - a.total_score)
        .map((p, idx, arr) => {
            // Handle tie rankings correctly by finding the first participant with this score
            let rank = idx + 1;
            if (idx > 0 && p.total_score === arr[idx - 1].total_score) {
                let firstSameScoreIdx = idx - 1;
                while (firstSameScoreIdx > 0 && arr[firstSameScoreIdx - 1].total_score === p.total_score) {
                    firstSameScoreIdx--;
                }
                rank = firstSameScoreIdx + 1;
            }
            return { ...p, rank };
        });
    }

    // --- Prizes CRUD ---
    getPrizes() {
        return this.state.prizes || [];
    }

    savePrize(prize) {
        if (!this.state.prizes) this.state.prizes = [];
        if (prize.id) {
            const index = this.state.prizes.findIndex(p => p.id === prize.id);
            if (index !== -1) {
                this.state.prizes[index] = { ...this.state.prizes[index], ...prize };
            }
        } else {
            prize.id = 'pz_' + Date.now();
            this.state.prizes.push(prize);
        }
        this.save();
    }

    deletePrize(id) {
        if (!this.state.prizes) return;
        this.state.prizes = this.state.prizes.filter(p => p.id !== id);
        this.save();
    }

    // --- Notices CRUD ---
    getNotices() {
        return this.state.notices;
    }

    saveNotice(notice) {
        if (notice.id) {
            const index = this.state.notices.findIndex(n => n.id === notice.id);
            if (index !== -1) {
                this.state.notices[index] = { ...this.state.notices[index], ...notice };
            }
        } else {
            notice.id = 'n_' + Date.now();
            notice.created_at = new Date().toISOString();
            this.state.notices.push(notice);
        }
        this.save();
        return notice;
    }

    deleteNotice(id) {
        this.state.notices = this.state.notices.filter(n => n.id !== id);
        this.save();
    }

    // --- Materials CRUD ---
    getMaterials() {
        return this.state.materials;
    }

    saveMaterial(material) {
        if (material.id) {
            const index = this.state.materials.findIndex(m => m.id === material.id);
            if (index !== -1) {
                this.state.materials[index] = { ...this.state.materials[index], ...material };
            }
        } else {
            material.id = 'm_' + Date.now();
            material.created_at = new Date().toISOString();
            this.state.materials.push(material);
        }
        this.save();
        return material;
    }

    deleteMaterial(id) {
        this.state.materials = this.state.materials.filter(m => m.id !== id);
        this.save();
    }

    // --- Event Settings ---
    getSettings() {
        return this.state.event_settings;
    }

    saveSettings(settings) {
        this.state.event_settings = { ...this.state.event_settings, ...settings };
        this.save();
        return this.state.event_settings;
    }

    // --- Auth Settings ---
    getAuthSettings() {
        // Fallback for existing databases
        return this.state.auth_settings || { admin_pass: 'admin123', admin_recovery_email: '', judge_pass: 'judge123', judge_recovery_email: '' };
    }

    saveAuthSettings(settings) {
        this.state.auth_settings = { ...this.getAuthSettings(), ...settings };
        this.save();
    }

    // --- Certificate Customization Settings ---
    getCertificateSettings() {
        // Ensure defaults exist if restoring older backups without these fields
        if (!this.state.certificate_settings) {
            this.state.certificate_settings = { ...INITIAL_DATA.certificate_settings };
        }
        if (!this.state.certificate_settings.signatories) {
            this.state.certificate_settings.signatories = [...INITIAL_DATA.certificate_settings.signatories];
        }
        if (this.state.certificate_settings.logo_url === undefined) {
            this.state.certificate_settings.logo_url = '';
        }
        if (this.state.certificate_settings.watermark_url === undefined) {
            this.state.certificate_settings.watermark_url = '';
        }
        return this.state.certificate_settings;
    }

    saveCertificateSettings(settings) {
        this.state.certificate_settings = { ...this.getCertificateSettings(), ...settings };
        this.save();
        return this.state.certificate_settings;
    }
    // --- Gallery CRUD ---
    getGallery() {
        return this.state.gallery || [];
    }
    saveGalleryPhoto(photo) {
        if(!this.state.gallery) this.state.gallery = [];
        if (photo.id) {
            const index = this.state.gallery.findIndex(g => g.id === photo.id);
            if (index !== -1) {
                this.state.gallery[index] = { ...this.state.gallery[index], ...photo };
            }
        } else {
            photo.id = 'g_' + Date.now();
            this.state.gallery.push(photo);
        }
        this.save();
        return photo;
    }
    deleteGalleryPhoto(id) {
        if(!this.state.gallery) return false;
        this.state.gallery = this.state.gallery.filter(g => g.id !== id);
        this.save();
        return true;
    }

    // --- Team Members CRUD ---
    getTeamMembers() {
        return this.state.team_members || [];
    }
    saveTeamMember(member) {
        if(!this.state.team_members) this.state.team_members = [];
        if (member.id) {
            const index = this.state.team_members.findIndex(t => t.id === member.id);
            if (index !== -1) {
                this.state.team_members[index] = { ...this.state.team_members[index], ...member };
            }
        } else {
            member.id = 't_' + Date.now();
            this.state.team_members.push(member);
        }
        this.save();
        return member;
    }
    deleteTeamMember(id) {
        if(!this.state.team_members) return false;
        this.state.team_members = this.state.team_members.filter(t => t.id !== id);
        this.save();
        return true;
    }
    // --- Messages (Contact Form) ---
    getMessages() {
        return [...(this.state.messages || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    addMessage(msg) {
        if (!this.state.messages) this.state.messages = [];
        this.state.messages.push({
            id: 'msg_' + Date.now(),
            name: msg.name,
            contact: msg.contact,
            message: msg.message,
            read: false,
            created_at: new Date().toISOString()
        });
        this.save();
    }

    deleteMessage(id) {
        if (!this.state.messages) return;
        this.state.messages = this.state.messages.filter(m => m.id !== id);
        this.save();
    }

    // --- Contact Settings ---
    getContactSettings() {
        return { ...this.state.contact_settings };
    }

    updateContactSettings(settings) {
        this.state.contact_settings = { ...this.state.contact_settings, ...settings };
        this.save();
    }
}

// Initialise Database
const db = new LocalDatabase();

// Export to window object for access in SPAs
window.db = db;

// Start Firebase real-time sync AFTER window.db is ready
// FirebaseSync is defined in js/firebase-sync.js (loaded before this file)
document.addEventListener('DOMContentLoaded', () => {
    if (window.FirebaseSync) {
        window.FirebaseSync.init();
    }
});
