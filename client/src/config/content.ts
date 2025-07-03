// Editable content configuration (this was used before the database was implemented)
export const content = {
  homepage: {
    aboutUs: {
      title: "About Us",
      text: `Seatwell is a Swiss startup revolutionizing the sports ticket marketplace. We connect season ticket holders who cannot attend specific games with passionate fans looking for tickets. Our platform ensures fair pricing, secure transactions, and transforms every empty seat into an opportunity for someone to experience the thrill of live sports.

Founded with the vision of making sports more accessible, we believe every fan deserves a chance to support their team, even when games are sold out.`
    },
    faq: [
      {
        question: "How does Seatwell work?",
        answer: "Season ticket holders list their unused tickets on our platform. Buyers can browse available tickets, select seats, and purchase securely. We handle the entire transaction process."
      },
      {
        question: "Is it safe to buy tickets through Seatwell?",
        answer: "Absolutely. All transactions are secure, and we verify every ticket listing. You receive official tickets with full guarantee of authenticity."
      },
      {
        question: "What happens if a game is cancelled?",
        answer: "In case of cancellation, buyers receive full refunds automatically. Sellers are notified immediately and their tickets are removed from sale."
      },
      {
        question: "How quickly do I receive my payout as a seller?",
        answer: "Payouts are processed within 3-5 business days after the game takes place. You'll receive email confirmation once the transfer is complete."
      },
      {
        question: "Can I sell tickets for any Swiss sports team?",
        answer: "Currently we focus on major Swiss hockey teams. We're expanding to other sports - contact us if you'd like your team included."
      }
    ]
  },
  sellTicket: {
    expectedPayoutText: "Based on x% of average resale price - this percentage may vary depending on demand and game popularity",
    bankInfoExplanation: {
      title: "Why we ask for your bank details:",
      text: "We use your bank information to process your payout after your ticket is resold. You retain full ownership of your ticket until it is purchased. Payments are transferred securely within 3–5 business days after the game."
    },
    dataSecurityStatement: "Your data is safe with us. Seatwell treats your personal and financial information with the highest level of security. Your data is encrypted and will never be shared with third parties."
  },
  contact: {
    title: "Contact Us",
    subtitle: "Get in touch with the Seatwell team",
    description: "Have questions about buying or selling tickets? Need support with your account? We're here to help you make the most of your sports experience."
  }
};

export const theme = {
  background: {

    global: {
      type: "solid", 
      gradient: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      solid: "#000000"
    },

    homepage: {
      type: "image",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      solid: "#1e293b"
    }
  }
};