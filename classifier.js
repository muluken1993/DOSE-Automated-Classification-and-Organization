class DocumentClassifier {
    constructor() {
        console.log('✅ DocumentClassifier initialized');
        this.rules = {
            invoice: [
                { pattern: /[\u1200-\u137F].*?(ደረሰኝ|ፋክተር|ቢል|ሪሴፕት|ክፍያ|ግብይት)/, weight: 3.0 },
                { pattern: /[\u1200-\u137F].*?(ጠቅላላ|ድምር|ታክስ|ግብይት ታክስ)/, weight: 2.5 },
                { pattern: /[\u1200-\u137F].*?(የሽያጭ|የግዢ|የክፍያ|የተለጠፈ)/, weight: 3.5 },
                { pattern: /\b(invoice|bill|receipt|payment|voucher|statement)\b/i, weight: 3.0 },
                { pattern: /\b(sales invoice|purchase invoice|tax invoice|commercial invoice)\b/i, weight: 4.0 },
                { pattern: /\b(total amount|subtotal|tax amount|grand total|balance due)\b/i, weight: 2.5 },
                { pattern: /(ብር|ዶላር|ኢዩሮ|£|\$|€)\s*[\d,]+\.?\d*/i, weight: 2.0 },
                { pattern: /\b(INV-\d+|BILL-\d+|ፋክተር-\d+|REC-\d+)/i, weight: 3.0 }
            ],
            
            contract: [
                { pattern: /[\u1200-\u137F].*?(ውል|ስምምነት|ኪራይ|ግብይት|ቃል ኪዳን)/, weight: 3.0 },
                { pattern: /[\u1200-\u137F].*?(ፊርማ|ተፈራረማ|ማህተም|የማህተም)/, weight: 2.5 },
                { pattern: /[\u1200-\u137F].*?(ውሎ|በዚህ ውል|በዚህ ስምምነት)/, weight: 2.0 },
                { pattern: /\b(contract|agreement|lease|deed|covenant|treaty)\b/i, weight: 3.0 },
                { pattern: /\b(employment contract|service agreement|rental agreement|partnership)\b/i, weight: 4.0 },
                { pattern: /\b(signature|signed|witness|notary|seal|stamp)\b/i, weight: 2.5 },
                { pattern: /\b(party|clause|article|section|whereas|therefore)\b/i, weight: 2.0 }
            ],
            
            report: [
                { pattern: /[\u1200-\u137F].*?(ሪፖርት|ማጠቃለያ|ግኝት|ትንተና|የምርምር)/, weight: 3.0 },
                { pattern: /[\u1200-\u137F].*?(ማጠቃለያ|የሥራ አፈጻጸም|ውጤት|መደምደሚያ)/, weight: 2.5 },
                { pattern: /[\u1200-\u137F].*?(የበጀት|ዓመታዊ|ወርሃዊ|የሥራ አፈጻጸም)/, weight: 3.5 },
                { pattern: /\b(report|summary|analysis|findings|research|evaluation)\b/i, weight: 3.0 },
                { pattern: /\b(annual report|monthly report|progress report|performance report)\b/i, weight: 4.0 },
                { pattern: /\b(executive summary|conclusion|recommendation|methodology)\b/i, weight: 2.5 },
                { pattern: /\b(graph|chart|table|figure|diagram|statistics)\b/i, weight: 2.0 }
            ],
            
            id_card: [
                { pattern: /[\u1200-\u137F].*?(መታወቂያ ካርድ|የመንግሥት መታወቂያ|ዲጂታል መታወቂያ)/, weight: 4.0 },
                { pattern: /[\u1200-\u137F].*?(ስም|የአባት ስም|የአያት ስም|የትውልድ ስፍራ|ጾታ)/, weight: 3.0 },
                { pattern: /[\u1200-\u137F].*?(የትውልድ ቀን|ተወለደበት ቀን|አድራሻ|የተወለደበት ቦታ)/, weight: 2.5 },
                { pattern: /[\u1200-\u137F].*?(ፎቶ|ስእል|የፎቶ ስእል|ፎቶግራፍ)/, weight: 2.0 },
                { pattern: /\b(ID card|identification card|identity document|government ID)\b/i, weight: 4.0 },
                { pattern: /\b(full name|date of birth|place of birth|gender|nationality)\b/i, weight: 3.0 },
                { pattern: /\b(address|residence|photo|photograph|signature)\b/i, weight: 2.5 },
                { pattern: /\b(ID number|identification number|personal number)\b/i, weight: 3.0 }
            ],
            
            educational: [
                { pattern: /[\u1200-\u137F].*?(ዲፕሎማ|ማረጋገጫ|ተመስጣኝ|የትምህርት ማረጋገጫ)/, weight: 4.0 },
                { pattern: /[\u1200-\u137F].*?(ዩኒቨርሲቲ|ኮሌጅ|ት\/ቤት|ትምህርት ቤት|ከፍተኛ ትምህርት)/, weight: 3.0 },
                { pattern: /[\u1200-\u137F].*?(ነጥብ|ውጤት|ፅድቅ|መጠን|ደረጃ|ምዘና)/, weight: 2.5 },
                { pattern: /\b(diploma|certificate|transcript|degree|qualification)\b/i, weight: 4.0 },
                { pattern: /\b(university|college|school|institution|academy)\b/i, weight: 3.0 },
                { pattern: /\b(grade|score|mark|point|GPA|credit|assessment)\b/i, weight: 2.5 },
                { pattern: /\b(bachelor|master|doctorate|PhD|undergraduate|graduate)\b/i, weight: 3.0 }
            ],
            
            medical: [
                { pattern: /[\u1200-\u137F].*?(ጤና|ህክምና|የጤና ማረጋገጫ|ምርመራ|የጤና መግለጫ)/, weight: 4.0 },
                { pattern: /[\u1200-\u137F].*?(ዶክተር|ሀኪም|መድሃኒት|በሽታ|ሕማም|የጤና ባለሙያ)/, weight: 3.0 },
                { pattern: /[\u1200-\u137F].*?(ላቦራቶሪ|በሽታ መጠሪያ|ሕማም|የደም ምርመራ)/, weight: 2.5 },
                { pattern: /\b(medical|health|treatment|diagnosis|examination)\b/i, weight: 4.0 },
                { pattern: /\b(doctor|physician|prescription|medicine|drug|illness)\b/i, weight: 3.0 },
                { pattern: /\b(laboratory|test|blood test|medical test|diagnostic)\b/i, weight: 2.5 },
                { pattern: /\b(patient|medical history|family history|symptoms)\b/i, weight: 2.0 }
            ],
            
            license: [
                { pattern: /[\u1200-\u137F].*?(ፍቃድ|ብቃት ማረጋገጫ|ማረጋገጫ|የሥራ ፍቃድ)/, weight: 4.0 },
                { pattern: /[\u1200-\u137F].*?(የሥራ ፍቃድ|የንግድ ፍቃድ|የመንጃ ፍቃድ|የቢዝነስ ፍቃድ)/, weight: 3.5 },
                { pattern: /[\u1200-\u137F].*?(ባለቤት|ተፈቃድ|የተፈቀደ|የሚሠራበት ጊዜ)/, weight: 2.5 },
                { pattern: /\b(license|certificate|permit|authorization|accreditation)\b/i, weight: 4.0 },
                { pattern: /\b(business license|driver license|work permit|professional license)\b/i, weight: 4.0 },
                { pattern: /\b(license number|certificate number|permit number)\b/i, weight: 3.0 },
                { pattern: /\b(licensed|certified|authorized|accredited|registered)\b/i, weight: 2.5 }
            ],
            
            legal: [
                { pattern: /[\u1200-\u137F].*?(የሕግ ሰነድ|ፍርድ|ፍትሕ|በፍርድ ቤት|የሕግ አዋጅ)/, weight: 4.0 },
                { pattern: /[\u1200-\u137F].*?(ክርክር|መርማሪ|መከላከያ|ተከሳሽ|ጠበቃ)/, weight: 3.0 },
                { pattern: /\b(legal document|court|judgment|law|statute)\b/i, weight: 4.0 },
                { pattern: /\b(plaintiff|defendant|lawyer|attorney|case)\b/i, weight: 3.0 }
            ],
            
            other: [
                { pattern: /[\u1200-\u137F].*?(ሰነድ|ፋይል|ወረቀት|መግለጫ|መረጃ)/, weight: 1.0 },
                { pattern: /\b(document|file|paper|statement|information)\b/i, weight: 1.0 }
            ]
        };

        // Enhanced threshold with adaptive scoring
        this.confidenceThreshold = 1.5;
        this.minTextLength = 10;
        
        // Context patterns for better accuracy
        this.contextPatterns = {
            invoice: { 
                datePattern: /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})\b/,
                amountPattern: /(\$|€|£|ብር)\s*[\d,]+\.?\d*/ 
            },
            id_card: {
                idPattern: /\b(ID|መታወቂያ)[\s:]*([A-Z0-9\-]+)\b/i
            },
            contract: {
                datePattern: /\b(effective|signed|dated)[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/i
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

            console.log(`Document classified as: ${classifiedCategory} with score: ${maxScore}`);
            return classifiedCategory;

        } catch (error) {
            console.error('Error in classifier:', error);
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
                    }
                } catch (error) {
                    console.warn(`Error in pattern for ${category}:`, error);
                }
            }
        }
        return scores;
    }

    applyContextBoost(text, scores) {
        if (this.contextPatterns.invoice.datePattern.test(text) && 
            this.contextPatterns.invoice.amountPattern.test(text)) {
            scores.invoice += 1.0;
        }
        
        if (this.contextPatterns.id_card.idPattern.test(text)) {
            scores.id_card += 1.5;
        }
        
        if (this.contextPatterns.contract.datePattern.test(text)) {
            scores.contract += 1.0;
        }
    }

    isAmbiguous(scores, maxScore) {
        const closeCategories = Object.entries(scores).filter(
            ([, score]) => score > maxScore * 0.7 && score > this.confidenceThreshold
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
            scores: scores
        };
    }

    testClassification() {
        const testCases = [
            {
                text: 'የመንግሥት መታወቂያ ካርድ ሙሉ ስም አባት ስም ተወለደበት ቀን አድራሻ ፎቶ መታወቂያ ቁጥር የተሰጠበት ቀን',
                expected: 'id_card',
                language: 'Amharic ID Card'
            },
            {
                text: 'የሽያጭ ፋክተር ቁጥር INV-001 ቀን 2024-01-15 ጠቅላላ መጠን 1000 ብር የታክስ መጠን 150 ብር',
                expected: 'invoice',
                language: 'Amharic Invoice'
            },
            {
                text: 'የሥራ ውል ስምምነት በኩባንያ እና በሰራተኛ መካከል ፊርማ ማህተም ውሎች እና ሁኔታዎች',
                expected: 'contract',
                language: 'Amharic Contract'
            },
            {
                text: 'ዓመታዊ ሪፖርት ማጠቃለያ የሥራ አፈጻጸም ትንተና ውጤት ማጠቃለያ ሃሳብ የበጀት ሪፖርት',
                expected: 'report',
                language: 'Amharic Report'
            },
            {
                text: 'INVOICE NUMBER INV-001 DATE 2024-01-15 TOTAL AMOUNT $1000.00 TAX AMOUNT $150.00',
                expected: 'invoice',
                language: 'English Invoice'
            },
            {
                text: 'EMPLOYMENT CONTRACT AGREEMENT BETWEEN COMPANY AND EMPLOYEE SIGNATURE WITNESS',
                expected: 'contract',
                language: 'English Contract'
            }
        ];

        let passed = 0;
        
        testCases.forEach((testCase, index) => {
            const result = this.classify(testCase.text);
            const success = result === testCase.expected;
            if (success) passed++;
            
            console.log(`Test ${index + 1} (${testCase.language}): ${success ? 'yes' : 'No'} ${result} (expected: ${testCase.expected})`);
        });

        console.log(`📊 Enhanced Test Results: ${passed}/${testCases.length} passed`);
        return passed >= testCases.length * 0.7;
    }

    getCategoryDisplayName(category) {
        const displayNames = {
            invoice: 'Invoice / Bill',
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
            invoice: 'የገቢዎች መግለጫ / ፋክተር',
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
}

const classifier = new DocumentClassifier();

try {
    const testResult = classifier.testClassification();
    console.log(` classifier test: ${testResult ? 'PASSED' : 'FAILED'}`);
} catch (error) {
    console.error('classifier test failed:', error);
}

module.exports = classifier;
