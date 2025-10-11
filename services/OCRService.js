// services/OCRService.js - Enhanced version with no external dependencies
export class OCRService {
  static async extractTextFromImage(imageUri) {
    // Simulate text extraction from image
    // In a real app, this would use actual OCR
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate finding text in different positions
        const simulatedText = this.simulateTextExtraction();
        resolve(simulatedText);
      }, 2000);
    });
  }

  static simulateTextExtraction() {
    const possibleTexts = [
      "NATIONAL IDENTITY CARD\nREPUBLIC OF SRI LANKA\nNIC: 901234567V\nNAME: JOHN DOE\nBIRTH: 1990-01-01",
      "IDENTITY CARD\nNIC 123456789012\nSRI LANKA\nNAME: JANE SMITH",
      "REPUBLIC OF SRI LANKA\nNATIONAL ID CARD\nID: 851234567X\nHOLDER: ALEX BROWN",
      "NIC 941234567V\nSRI LANKA ID CARD\nNAME: SARAH WILSON\nDOB: 15/03/1985"
    ];
    
    return possibleTexts[Math.floor(Math.random() * possibleTexts.length)];
  }

  static async extractNICData(text) {
    // Enhanced NIC pattern matching
    const nicPatterns = [
      /NIC[:\\s]*([\\d]{9}[VXvx])/i,
      /NIC[:\\s]*([\\d]{12})/i,
      /ID[:\\s]*([\\d]{9}[VXvx])/i,
      /ID[:\\s]*([\\d]{12})/i,
      /([\\d]{9}[VXvx])/,
      /([\\d]{12})/
    ];

    let nicNumber = null;
    
    for (const pattern of nicPatterns) {
      const match = text.match(pattern);
      if (match) {
        nicNumber = match[1];
        break;
      }
    }

    if (nicNumber) {
      const isValid = /^(\d{9}[VXvx]|\d{12})$/.test(nicNumber);
      return {
        nicNumber: isValid ? nicNumber.toUpperCase() : null,
        isValid,
        type: nicNumber.length === 10 ? 'old' : 'new',
        rawText: text,
        confidence: 0.9,
        extractedFrom: 'image_analysis'
      };
    }

    return { 
      isValid: false, 
      rawText: text,
      confidence: 0.1
    };
  }

  static async verifyDocument(imageUri, documentType = 'nic') {
    try {
      console.log('Processing document with simulated OCR...');
      
      const text = await this.extractTextFromImage(imageUri);
      console.log('Extracted text:', text);
      
      switch (documentType) {
        case 'nic':
          const result = await this.extractNICData(text);
          console.log('NIC extraction result:', result);
          return result;
        default:
          throw new Error('Unsupported document type');
      }
    } catch (error) {
      console.error('Document verification error:', error);
      // Fallback to manual verification
      return {
        isValid: false,
        error: error.message,
        fallback: true
      };
    }
  }

  // Enhanced manual validation
  static validateNICManually(nicNumber) {
    if (!nicNumber) {
      return { 
        isValid: false, 
        error: 'No NIC number provided',
        confidence: 0 
      };
    }

    const cleanedNIC = nicNumber.toString().trim().toUpperCase();
    
    const oldFormat = /^(\d{9}[VX])$/;
    const newFormat = /^(\d{12})$/;
    
    let isValid = false;
    let type = null;
    let formatted = null;
    let confidence = 0.8; // Base confidence for manual entry

    if (oldFormat.test(cleanedNIC)) {
      isValid = true;
      type = 'old';
      formatted = cleanedNIC;
      confidence = 0.85;
    } else if (newFormat.test(cleanedNIC)) {
      isValid = true;
      type = 'new';
      formatted = cleanedNIC;
      confidence = 0.9;
    }

    return {
      isValid,
      nicNumber: formatted,
      type,
      confidence,
      method: 'manual_validation',
      timestamp: new Date().toISOString()
    };
  }

  // Combined verification method
  static async comprehensiveVerify(nicNumber, imageUri = null) {
    if (imageUri) {
      try {
        // Try image-based verification first
        const imageResult = await this.verifyDocument(imageUri, 'nic');
        if (imageResult.isValid) {
          return {
            ...imageResult,
            method: 'image_ocr',
            verificationLevel: 'high'
          };
        }
      } catch (error) {
        console.log('Image verification failed, falling back to manual');
      }
    }

    // Fallback to manual verification
    const manualResult = this.validateNICManually(nicNumber);
    return {
      ...manualResult,
      method: imageUri ? 'manual_fallback' : 'manual_primary',
      verificationLevel: imageUri ? 'medium' : 'basic'
    };
  }

  static cleanExtractedText(text) {
    return text
      .replace(/[^a-zA-Z0-9VX\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Utility to generate realistic verification report
  static generateVerificationReport(nicNumber, imageUri, result) {
    return {
      verificationId: `VRF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      nicNumber: result.nicNumber,
      isValid: result.isValid,
      verificationMethod: result.method,
      confidence: result.confidence,
      imageUsed: !!imageUri,
      timestamp: new Date().toISOString(),
      details: {
        format: result.type,
        input: nicNumber,
        processed: result.nicNumber,
        checks: {
          format: result.isValid,
          length: nicNumber.length === 10 || nicNumber.length === 12,
          characters: /^[0-9VX]+$/.test(nicNumber)
        }
      }
    };
  }
}