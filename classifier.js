class DocumentClassifier {
    constructor() {
        console.log('✅ DocumentClassifier initialized');
        this.rules = {
            invoice: [
                // Amharic Invoice Patterns
                { pattern: /[\u1200-\u137F].*?(ደረሰኝ|ፋክተር|ቢል|ሪሴፕት|ክፍያ|ግብይት|የግብይት)/, weight: 3.5 },
                { pattern: /[\u1200-\u137F].*?(ጠቅላላ|ድምር|ታክስ|ግብይት ታክስ|ተ.ከፋይ|ዋጋ)/, weight: 3.0 },
                { pattern: /[\u1200-\u137F].*?(የሽያጭ|የግዢ|የክፍያ|የተለጠፈ|የንግድ)/, weight: 4.0 },
                { pattern: /[\u1200-\u137F].*?(ቀን|ታሪፍ|ቁጥር|መጠን|ዋጋ)/, weight: 2.5 },
                { pattern: /[\u1200-\u137F].*?(ከፋይ|ሸማች|ደንበኛ|ኩባንያ)/, weight: 2.0 },
                
                // English Invoice Patterns
                { pattern: /\b(invoice|bill|receipt|payment|voucher|statement)\b/i, weight: 3.5 },
                { pattern: /\b(sales invoice|purchase invoice|tax invoice|commercial invoice|proforma)\b/i, weight: 4.0 },
                { pattern: /\b(total amount|subtotal|tax amount|grand total|balance due|amount due)\b/i, weight: 3.0 },
                { pattern: /\b(paid|unpaid|pending|settled|outstanding)\b/i, weight: 2.5 },
                { pattern: /\b(customer|client|buyer|seller|vendor|supplier)\b/i, weight: 2.0 },
                { pattern: /(ብር|ዶላር|ኢዩሮ|£|\$|€|ETB)\s*[\d,]+\.?\d*/i, weight: 3.0 },
                { pattern: /\b(INV-\d+|BILL-\d+|ፋክተር-\d+|REC-\d+|INV\d+|RC\d+)/i, weight: 3.5 },
                { pattern: /\b(quantity|qty|unit price|description|item)\b/i, weight: 2.5 }
            ],
            
            contract: [
                // Amharic Contract Patterns
                { pattern: /[\u1200-\u137F].*?(ውል|ስምምነት|ኪራይ|ግብይት|ቃል ኪዳን|ስምምነት)/, weight: 4.0 },
                { pattern: /[\u1200-\u137F].*?(ፊርማ|ተፈራረማ|ማህተም|የማህተም|ምልክት)/, weight: 3.5 },
                { pattern: /[\u1200-\u137F].*?(ውሎ|በዚህ ውል|በዚህ ስምምነት|የተሰማራ)/, weight: 3.0 },
                { pattern: /[\u1200-\u137F].*?(አንቀፅ|ክፍል|ዓንቀጽ|ሁኔታ|ደንብ)/, weight: 2.5 },
                { pattern: /[\u1200-\u137F].*?(ወቅት|ጊዜ|ቀን|የሚጀምር|የሚያበቃ)/, weight: 2.0 },
                
                // English Contract Patterns
                { pattern: /\b(contract|agreement|lease|deed|covenant|treaty|pact)\b/i, weight: 4.0 },
                { pattern: /\b(employment contract|service agreement|rental agreement|partnership|memorandum)\b/i, weight: 4.5 },
                { pattern: /\b(signature|signed|witness|notary|seal|stamp|endorsement)\b/i, weight: 3.5 },
                { pattern: /\b(party|clause|article|section|whereas|therefore|hereby)\b/i, weight: 3.0 },
                { pattern: /\b(terms and conditions|obligations|rights|responsibilities)\b/i, weight: 3.0 },
                { pattern: /\b(effective date|termination|renewal|duration|period)\b/i, weight: 2.5 }
            ],
            
            report: [
                // Amharic Report Patterns
                { pattern: /[\u1200-\u137F].*?(ሪፖርት|ማጠቃለያ|ግኝት|ትንተና|የምርምር|ዘገባ)/, weight: 4.0 },
                { pattern: /[\u1200-\u137F].*?(ማጠቃለያ|የሥራ አፈጻጸም|ውጤት|መደምደሚያ|ሃሳብ)/, weight: 3.5 },
                { pattern: /[\u1200-\u137F].*?(የበጀት|ዓመታዊ|ወርሃዊ|የሥራ አፈጻጸም|የትንታኔ)/, weight: 3.5 },
                { pattern: /[\u1200-\u137F].*?(ግምገማ|ምዘና|ደረጃ|ነጥብ|ውጤት)/, weight: 3.0 },
                
                // English Report Patterns
                { pattern: /\b(report|summary|analysis|findings|research|evaluation|study)\b/i, weight: 4.0 },
                { pattern: /\b(annual report|monthly report|progress report|performance report|financial report)\b/i, weight: 4.5 },
                { pattern: /\b(executive summary|conclusion|recommendation|methodology|results)\b/i, weight: 3.5 },
                { pattern: /\b(graph|chart|table|figure|diagram|statistics|data)\b/i, weight: 3.0 },
                { pattern: /\b(analysis|evaluation|assessment|review|audit)\b/i, weight: 3.0 },
                { pattern: /\b(objective|scope|methodology|limitations|appendix)\b/i, weight: 2.5 }
            ],
            
            id_card: [
                // Amharic ID Card Patterns
                { pattern: /[\u1200-\u137F].*?(መታወቂያ ካርድ|የመንግሥት መታወቂያ|ዲጂታል መታወቂያ|አይ ዲ ካርድ)/, weight: 5.0 },
                { pattern: /[\u1200-\u137F].*?(ስም|የአባት ስም|የአያት ስም|የትውልድ ስፍራ|ጾታ|ፆታ)/, weight: 4.0 },
                { pattern: /[\u1200-\u137F].*?(የትውልድ ቀን|ተወለደበት ቀን|አድራሻ|የተወለደበት ቦታ|ቀን የተወለደ)/, weight: 3.5 },
                { pattern: /[\u1200-\u137F].*?(ፎቶ|ስእል|የፎቶ ስእል|ፎቶግራፍ|ምስል)/, weight: 3.0 },
                { pattern: /[\u1200-\u137F].*?(የተሰጠበት ቀን|የሚያበቃበት ቀን|ብቃት|ማረጋገጫ)/, weight: 3.0 },
                
                // English ID Card Patterns
                { pattern: /\b(ID card|identification card|identity document|government ID|national ID)\b/i, weight: 5.0 },
                { pattern: /\b(full name|date of birth|place of birth|gender|nationality|citizenship)\b/i, weight: 4.0 },
                { pattern: /\b(address|residence|photo|photograph|signature|picture)\b/i, weight: 3.5 },
                { pattern: /\b(ID number|identification number|personal number|card number)\b/i, weight: 4.0 },
                { pattern: /\b(expiry date|date of issue|valid until|issued date)\b/i, weight: 3.5 },
                { pattern: /\b(passport|driver license|residence permit|work permit)\b/i, weight: 4.0 }
            ],
            
            educational: [
                // Amharic Educational Patterns
                { pattern: /[\u1200-\u137F].*?(ዲፕሎማ|ማረጋገጫ|ተመስጣኝ|የትምህርት ማረጋገጫ|ማስረጃ)/, weight: 5.0 },
                { pattern: /[\u1200-\u137F].*?(ዩኒቨርሲቲ|ኮሌጅ|ት\/ቤት|ትምህርት ቤት|ከፍተኛ ትምህርት|አካዳሚ)/, weight: 4.0 },
                { pattern: /[\u1200-\u137F].*?(ነጥብ|ውጤት|ፅድቅ|መጠን|ደረጃ|ምዘና|ምደባ)/, weight: 3.5 },
                { pattern: /[\u1200-\u137F].*?(ተማሪ|ተማሪዎች|መምህር|ፕሮፌሰር|ዶክተር)/, weight: 3.0 },
                { pattern: /[\u1200-\u137F].*?(ኮርስ|መደብ|ትምህርት|ጥናት|ምረቃ)/, weight: 3.0 },
                
                // English Educational Patterns
                { pattern: /\b(diploma|certificate|transcript|degree|qualification|credential)\b/i, weight: 5.0 },
                { pattern: /\b(university|college|school|institution|academy|faculty)\b/i, weight: 4.0 },
                { pattern: /\b(grade|score|mark|point|GPA|credit|assessment|examination)\b/i, weight: 3.5 },
                { pattern: /\b(bachelor|master|doctorate|PhD|undergraduate|graduate|postgraduate)\b/i, weight: 4.0 },
                { pattern: /\b(course|subject|module|program|curriculum|syllabus)\b/i, weight: 3.0 },
                { pattern: /\b(graduation|completion|award|honors|distinction)\b/i, weight: 3.0 }
            ],
            
            medical: [
                // Amharic Medical Patterns
                { pattern: /[\u1200-\u137F].*?(ጤና|ህክምና|የጤና ማረጋገጫ|ምርመራ|የጤና መግለጫ|ህክምናዊ)/, weight: 5.0 },
                { pattern: /[\u1200-\u137F].*?(ዶክተር|ሀኪም|መድሃኒት|በሽታ|ሕማም|የጤና ባለሙያ)/, weight: 4.0 },
                { pattern: /[\u1200-\u137F].*?(ላቦራቶሪ|በሽታ መጠሪያ|ሕማም|የደም ምርመራ|በሽታ ማረጋገጫ)/, weight: 3.5 },
                { pattern: /[\u1200-\u137F].*?(ህመም|ምልክት|ስሜት|ቁጥጥር|መጠን)/, weight: 3.0 },
                { pattern: /[\u1200-\u137F].*?(ሕክምና ቤት|ጤና ጣቢያ|ሆስፒታል|ክሊኒክ)/, weight: 3.5 },
                
                // English Medical Patterns
                { pattern: /\b(medical|health|treatment|diagnosis|examination|healthcare)\b/i, weight: 5.0 },
                { pattern: /\b(doctor|physician|prescription|medicine|drug|illness|disease)\b/i, weight: 4.0 },
                { pattern: /\b(laboratory|test|blood test|medical test|diagnostic|scan)\b/i, weight: 3.5 },
                { pattern: /\b(patient|medical history|family history|symptoms|condition)\b/i, weight: 3.5 },
                { pattern: /\b(hospital|clinic|health center|medical center|pharmacy)\b/i, weight: 3.0 },
                { pattern: /\b(prescription|medication|dosage|frequency|duration)\b/i, weight: 3.0 }
            ],
            
            license: [
                // Amharic License Patterns
                { pattern: /[\u1200-\u137F].*?(ፍቃድ|ብቃት ማረጋገጫ|ማረጋገጫ|የሥራ ፍቃድ|ማሰረጃ)/, weight: 5.0 },
                { pattern: /[\u1200-\u137F].*?(የሥራ ፍቃድ|የንግድ ፍቃድ|የመንጃ ፍቃድ|የቢዝነስ ፍቃድ|የሥራ ማስረጃ)/, weight: 4.5 },
                { pattern: /[\u1200-\u137F].*?(ባለቤት|ተፈቃድ|የተፈቀደ|የሚሠራበት ጊዜ|የሚያገለግልበት)/, weight: 3.5 },
                { pattern: /[\u1200-\u137F].*?(የተሰጠበት ቀን|የሚያበቃበት ቀን|ብቃት|አይነት|ዓይነት)/, weight: 3.0 },
                
                // English License Patterns
                { pattern: /\b(license|certificate|permit|authorization|accreditation|certification)\b/i, weight: 5.0 },
                { pattern: /\b(business license|driver license|work permit|professional license|operating license)\b/i, weight: 4.5 },
                { pattern: /\b(license number|certificate number|permit number|registration number)\b/i, weight: 4.0 },
                { pattern: /\b(licensed|certified|authorized|accredited|registered|approved)\b/i, weight: 3.5 },
                { pattern: /\b(expiration date|renewal date|valid from|valid until|issue date)\b/i, weight: 3.0 }
            ],
            
            legal: [
                // Amharic Legal Patterns
                { pattern: /[\u1200-\u137F].*?(የሕግ ሰነድ|ፍርድ|ፍትሕ|በፍርድ ቤት|የሕግ አዋጅ|ሕጋዊ)/, weight: 5.0 },
                { pattern: /[\u1200-\u137F].*?(ክርክር|መርማሪ|መከላከያ|ተከሳሽ|ጠበቃ|ዓቃቤ ሕግ)/, weight: 4.0 },
                { pattern: /[\u1200-\u137F].*?(ፍርድ ቤት|ጉዳይ|ወንጀል|ሰበካ|ችሎት)/, weight: 3.5 },
                { pattern: /[\u1200-\u137F].*?(ማስረጃ|ማረጋገጫ|ሰነድ|ወረቀት|መረጃ)/, weight: 3.0 },
                
                // English Legal Patterns
                { pattern: /\b(legal document|court|judgment|law|statute|regulation)\b/i, weight: 5.0 },
                { pattern: /\b(plaintiff|defendant|lawyer|attorney|case|lawsuit)\b/i, weight: 4.0 },
                { pattern: /\b(affidavit|summons|warrant|subpoena|injunction)\b/i, weight: 4.5 },
                { pattern: /\b(evidence|testimony|witness|hearing|trial|proceeding)\b/i, weight: 3.5 },
                { pattern: /\b(judge|magistrate|prosecutor|counsel|advocate)\b/i, weight: 3.5 }
            ],
            
            other: [
                { pattern: /[\u1200-\u137F].*?(ሰነድ|ፋይል|ወረቀት|መግለጫ|መረጃ|መግለጫ)/, weight: 1.0 },
                { pattern: /\b(document|file|paper|statement|information|record)\b/i, weight: 1.0 }
            ]
        };

        // Enhanced threshold with adaptive scoring
        this.confidenceThreshold = 2.0;
        this.minTextLength = 10;
        
        // Context patterns for better accuracy
        this.contextPatterns = {
            invoice: { 
                datePattern: /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})\b/,
                amountPattern: /(\$|€|£|ብር|ETB)\s*[\d,]+\.?\d*/,
                invoicePattern: /\b(INV|BILL|REC|ፋክተር)[\-\s]*(\d+)/i
            },
            id_card: {
                idPattern: /\b(ID|መታወቂያ|Card)[\s:]*([A-Z0-9\-]+)\b/i,
                dobPattern: /\b(DOB|Date of Birth|የትውልድ ቀን)[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i
            },
            contract: {
                datePattern: /\b(effective|signed|dated|executed|ውጤታማ|ፊርማ)[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
                partyPattern: /\b(party|between|ከ...መካከል|በ...እና...መካከል)\b/i
            },
            educational: {
                gradePattern: /\b(GPA|CGPA|Grade|Score|ነጥብ|ደረጃ)[\s:]*([A-F]|\d+\.?\d*)/i,
                degreePattern: /\b(Bachelor|Master|Doctorate|Degree|ዲግሪ|ዲፕሎማ)\b/i
            }
        };
    }

    classify(text) {
        try {
            console.log('🔍 Classifying text, length:', text.length);
            
            if (!text || text.trim().length < this.minTextLength) {
                console.log('📝 Text too short, classifying as: other');
                return 'other';
            }

            const scores = this.calculateAllScores(text);
            
            // Apply context-based scoring boost
            this.applyContextBoost(text, scores);
            
            console.log('📈 Classification scores:', scores);

            let maxScore = 0;
            let classifiedCategory = 'other';

            for (const [category, score] of Object.entries(scores)) {
                if (score > maxScore) {
                    maxScore = score;
                    classifiedCategory = category;
                }
            }

            // Enhanced threshold logic
            if (maxScore < this.confidenceThreshold || this.isAmbiguous(scores, maxScore)) {
                return 'other';
            }

            console.log(`📄 Document classified as: ${classifiedCategory} with score: ${maxScore}`);
            return classifiedCategory;

        } catch (error) {
            console.error('❌ Error in classifier:', error);
            return 'other';
        }
    }

    calculateAllScores(text) {
        const scores = {};
        for (const category of Object.keys(this.rules)) {
            scores[category] = 0;
            for (const rule of this.rules[category]) {
                try {
                    const matches = text.match(rule.pattern);
                    if (matches) {
                        scores[category] += rule.weight;
                        // Bonus for multiple matches
                        if (matches.length > 1) {
                            scores[category] += (matches.length - 1) * 0.5;
                        }
                    }
                } catch (error) {
                    console.warn(`⚠️ Error in pattern for ${category}:`, error);
                }
            }
        }
        return scores;
    }

    applyContextBoost(text, scores) {
        // Invoice context boost
        if (this.contextPatterns.invoice.datePattern.test(text) && 
            this.contextPatterns.invoice.amountPattern.test(text)) {
            scores.invoice += 2.0;
        }
        
        // ID Card context boost
        if (this.contextPatterns.id_card.idPattern.test(text) && 
            this.contextPatterns.id_card.dobPattern.test(text)) {
            scores.id_card += 2.5;
        }
        
        // Contract context boost
        if (this.contextPatterns.contract.datePattern.test(text) && 
            this.contextPatterns.contract.partyPattern.test(text)) {
            scores.contract += 2.0;
        }
        
        // Educational context boost
        if (this.contextPatterns.educational.gradePattern.test(text) && 
            this.contextPatterns.educational.degreePattern.test(text)) {
            scores.educational += 2.0;
        }
        
        // Medical context boost for prescription patterns
        if (text.match(/\b(prescription|medication|dosage|መድሃኒት|መጠን)/i)) {
            scores.medical += 1.5;
        }
        
        // License context boost for expiration dates
        if (text.match(/\b(expir|valid|ብቃት|የሚያበቃ)/i)) {
            scores.license += 1.5;
        }
    }

    isAmbiguous(scores, maxScore) {
        const closeCategories = Object.entries(scores).filter(
            ([, score]) => score > maxScore * 0.6 && score > this.confidenceThreshold
        );
        return closeCategories.length > 1;
    }

    classifyWithConfidence(text) {
        const category = this.classify(text);
        const scores = this.calculateAllScores(text);
        const maxScore = scores[category];
        const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
        
        const confidence = totalScore > 0 ? (maxScore / totalScore) * 100 : 0;
        
        return {
            category: category,
            confidence: Math.min(100, Math.round(confidence)),
            scores: scores,
            language: this.detectLanguage(text)
        };
    }

    detectLanguage(text) {
        const amharicChars = text.match(/[\u1200-\u137F]/g);
        const englishChars = text.match(/[a-zA-Z]/g);
        
        if (amharicChars && englishChars) {
            return amharicChars.length > englishChars.length ? 'amharic' : 'english';
        } else if (amharicChars) {
            return 'amharic';
        } else if (englishChars) {
            return 'english';
        }
        return 'mixed';
    }

    testClassification() {
        const testCases = [
            // Amharic Test Cases
            {
                text: 'የመንግሥት መታወቂያ ካርድ ሙሉ ስም አባት ስም ተወለደበት ቀን አድራሻ ፎቶ መታወቂያ ቁጥር የተሰጠበት ቀን የሚያበቃበት ቀን',
                expected: 'id_card',
                language: 'Amharic ID Card'
            },
            {
                text: 'የሽያጭ ፋክተር ቁጥር INV-001 ቀን 2024-01-15 ጠቅላላ መጠን 1000 ብር የታክስ መጠን 150 ብር ደንበኛ ኩባንያ የክፍያ ዘዴ',
                expected: 'invoice',
                language: 'Amharic Invoice'
            },
            {
                text: 'የሥራ ውል ስምምነት በኩባንያ እና በሰራተኛ መካከል ፊርማ ማህተም ውሎች እና ሁኔታዎች አንቀፅ 1 አንቀፅ 2',
                expected: 'contract',
                language: 'Amharic Contract'
            },
            {
                text: 'ዓመታዊ ሪፖርት ማጠቃለያ የሥራ አፈጻጸም ትንተና ውጤት ማጠቃለያ ሃሳብ የበጀት ሪፖርት ግምገማ',
                expected: 'report',
                language: 'Amharic Report'
            },
            {
                text: 'የትምህርት ማረጋገጫ ዩኒቨርሲቲ ዲፕሎማ ተማሪ ነጥብ ውጤት ደረጃ ምደባ ኮርስ መደብ',
                expected: 'educational',
                language: 'Amharic Educational'
            },
            {
                text: 'የጤና ማረጋገጫ ህክምና ዶክተር መድሃኒት ምርመራ ላቦራቶሪ የደም ምርመራ ሕማም ምልክት',
                expected: 'medical',
                language: 'Amharic Medical'
            },

            // English Test Cases
            {
                text: 'INVOICE NUMBER INV-001 DATE 2024-01-15 TOTAL AMOUNT $1000.00 TAX AMOUNT $150.00 CUSTOMER COMPANY PAYMENT METHOD',
                expected: 'invoice',
                language: 'English Invoice'
            },
            {
                text: 'EMPLOYMENT CONTRACT AGREEMENT BETWEEN COMPANY AND EMPLOYEE SIGNATURE WITNESS TERMS AND CONDITIONS EFFECTIVE DATE',
                expected: 'contract',
                language: 'English Contract'
            },
            {
                text: 'ANNUAL REPORT EXECUTIVE SUMMARY PERFORMANCE ANALYSIS FINDINGS RECOMMENDATIONS CONCLUSION GRAPHS CHARTS',
                expected: 'report',
                language: 'English Report'
            },
            {
                text: 'GOVERNMENT ID CARD FULL NAME DATE OF BIRTH ADDRESS PHOTO ID NUMBER EXPIRY DATE PLACE OF BIRTH',
                expected: 'id_card',
                language: 'English ID Card'
            },
            {
                text: 'UNIVERSITY DIPLOMA BACHELOR DEGREE TRANSCRIPT GPA CREDITS COURSES GRADUATION DATE HONORS',
                expected: 'educational',
                language: 'English Educational'
            },
            {
                text: 'MEDICAL CERTIFICATE DOCTOR PRESCRIPTION MEDICATION LABORATORY TEST DIAGNOSIS TREATMENT HOSPITAL',
                expected: 'medical',
                language: 'English Medical'
            },
            {
                text: 'BUSINESS LICENSE PERMIT NUMBER ISSUE DATE EXPIRATION DATE AUTHORIZED ACTIVITIES REGISTRATION',
                expected: 'license',
                language: 'English License'
            },
            {
                text: 'COURT DOCUMENT LEGAL AFFIDAVIT WITNESS STATEMENT CASE NUMBER JUDGE SIGNATURE HEARING DATE',
                expected: 'legal',
                language: 'English Legal'
            }
        ];

        let passed = 0;
        
        testCases.forEach((testCase, index) => {
            const result = this.classify(testCase.text);
            const success = result === testCase.expected;
            if (success) passed++;
            
            const status = success ? '✅ PASS' : '❌ FAIL';
            console.log(`Test ${index + 1} (${testCase.language}): ${status} - Got: ${result}, Expected: ${testCase.expected}`);
        });

        const successRate = (passed / testCases.length) * 100;
        console.log(`📊 Enhanced Test Results: ${passed}/${testCases.length} passed (${successRate.toFixed(1)}%)`);
        
        return passed >= testCases.length * 0.7;
    }

    getCategoryDisplayName(category) {
        const displayNames = {
            invoice: 'Invoice / Bill / Receipt',
            contract: 'Contract / Agreement',
            report: 'Report / Analysis',
            id_card: 'ID Card / Identification',
            educational: 'Educational Document',
            medical: 'Medical Document',
            license: 'License / Certificate',
            legal: 'Legal Document',
            other: 'Other Document'
        };
        return displayNames[category] || category;
    }

    getCategoryAmharicName(category) {
        const amharicNames = {
            invoice: 'የገቢዎች መግለጫ / ፋክተር / ሬሲፕት',
            contract: 'ውል / ስምምነት',
            report: 'ሪፖርት / ትንተና',
            id_card: 'መታወቂያ ካርድ / መታወቂያ',
            educational: 'የትምህርት ሰነድ',
            medical: 'የጤና ሰነድ',
            license: 'ፍቃድ / ማረጋገጫ',
            legal: 'የሕግ ሰነድ',
            other: 'ሌላ ሰነድ'
        };
        return amharicNames[category] || category;
    }

    // Method to get detailed analysis for debugging
    analyzeText(text) {
        const scores = this.calculateAllScores(text);
        const language = this.detectLanguage(text);
        const classification = this.classifyWithConfidence(text);
        
        return {
            text: text.substring(0, 100) + '...',
            language: language,
            classification: classification,
            detailedScores: scores,
            wordCount: text.split(/\s+/).length,
            amharicCharacterCount: (text.match(/[\u1200-\u137F]/g) || []).length,
            englishCharacterCount: (text.match(/[a-zA-Z]/g) || []).length
        };
    }
}

// Enhanced testing and export
const classifier = new DocumentClassifier();

try {
    const testResult = classifier.testClassification();
    console.log(`Classifier test: ${testResult ? 'PASSED' : 'FAILED'}`);
    
    // Additional analysis examples
    console.log('Sample Analysis:');
    const sampleText = 'የሽያጭ ፋክተር ቁጥር INV-001 ጠቅላላ መጠን 1000 ብር';
    const analysis = classifier.analyzeText(sampleText);
    console.log('Analysis:', analysis);
    
} catch (error) {
    console.error('Classifier test failed:', error);
}

module.exports = classifier;