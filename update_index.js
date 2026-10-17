const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Harbor & Pine Accounting card PageSpeed (mobile, Oct 17, 2026): Performance 92, Accessibility 93, Best Practices 100, SEO 100. Remove 72, 92 and 91.
html = html.replace('PageSpeed Mobile Summary: 72 / 92 / 100 / 91', 'PageSpeed Mobile Summary: 92 / 93 / 100 / 100');
html = html.replace('<strong>72</strong> Perf • <strong>92</strong> A11y • <strong>100</strong> Best • <strong>91</strong> SEO', '<strong>92</strong> Perf • <strong>93</strong> A11y • <strong>100</strong> Best • <strong>100</strong> SEO');
html = html.replace('data-pagespeed="Performance 72 | Accessibility 92 | Best Practices 100 | SEO 91"', 'data-pagespeed="Performance 92 (Mobile, Oct 17, 2026) | Accessibility 93 | Best Practices 100 | SEO 100"');

// 2. Change "Most Popular" badge to "Recommended"
html = html.replace('<div class="popular-ribbon">Most Popular</div>', '<div class="popular-ribbon">Recommended</div>');

// 3. Remove "Over 70% of local service clients browse on smartphones". Replace every "High-Converting"/"high-converting" with "Booking-focused". Replace "loads instantly" with "is built to load quickly". Replace process line.
html = html.replace('Over 70% of local service clients browse on smartphones. Your site loads instantly and clicks to call effortlessly.', 'Your site is built to load quickly and clicks to call effortlessly.');
html = html.replace('loads instantly', 'is built to load quickly');
html = html.replace(/High-Converting/g, 'Booking-focused');
html = html.replace(/high-converting/g, 'Booking-focused');
html = html.replace('<span>Direct inbox email verified & 90+ PageSpeed</span>', '<span>Form tested to reach the inbox before launch; PageSpeed results shared at handover</span>');

// 4. Change "I STRIVE FOR PAY ATTENTION TO THE SMALLEST DETAILS" to "I pay attention to the smallest details."
html = html.replace('<p class="craft-quote">I strive for pay attention<br>to the smallest details</p>', '<p class="craft-quote">I pay attention to the smallest details.</p>');

// 5. Change Evergreen card description to "Concept site for a fictional home cleaning company with a quote request form."
html = html.replace('Fast, trustworthy, and fully functional prototype for a local home cleaning service.', 'Concept site for a fictional home cleaning company with a quote request form.');

// 6. Replace hero headline "Websites that turn visitors into clients." with "More booking requests from your website."
html = html.replace('<h2 class="hero-headline">Websites that turn<br>visitors into clients.</h2>', '<h2 class="hero-headline">More booking requests from your website.</h2>');

// 7. Replace flag emoji letters "US GB CA" with "US · UK · Canada"
html = html.replace(/<span class="target-flag">🇺🇸<\/span>\s*<span class="target-flag">🇬🇧<\/span>\s*<span class="target-flag">🇨🇦<\/span>/, '<span class="target-market-text">US · UK · Canada</span>');

// 10. Add contact form into Contact section so form fields and labels exist and are fully readable
const contactFormHTML = `
          <form class="contact-form-glass" action="https://formspree.io/f/sample" method="POST">
            <div class="form-row">
              <div class="form-group">
                <label for="contact-name">Your Name</label>
                <input type="text" id="contact-name" name="name" placeholder="John Doe" required>
              </div>
              <div class="form-group">
                <label for="contact-email">Email Address</label>
                <input type="email" id="contact-email" name="email" placeholder="john@example.com" required>
              </div>
            </div>
            <div class="form-group">
              <label for="contact-url">Current Website URL or Project Details</label>
              <input type="text" id="contact-url" name="website" placeholder="https://example.com or new project idea">
            </div>
            <div class="form-group">
              <label for="contact-msg">How Can I Help You?</label>
              <textarea id="contact-msg" name="message" rows="4" placeholder="Tell me about your business, target area, and booking goals..."></textarea>
            </div>
            <button type="submit" class="btn-primary form-submit-btn">
              <span>Send Request</span>
              <span class="btn-circle-arrow">↗</span>
            </button>
          </form>`;

if (!html.includes('class="contact-form-glass"')) {
  html = html.replace('<div class="footer-cta-actions">', contactFormHTML + '\n          <div class="footer-cta-actions">');
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html script updated successfully');
