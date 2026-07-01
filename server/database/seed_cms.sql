-- ============================================
-- CMS Default Content Seed
-- Populates cms_pages with default content
-- extracted from frontend public pages
-- ============================================

-- ============================================
-- HOME PAGE
-- ============================================
INSERT INTO cms_pages (page, section, content) VALUES
('home', 'hero', '{
  "badge": "Uganda''s Premier Learning Platform",
  "title": "Learn Anytime, Anywhere with Live Class Code",
  "subtitle": "Uganda''s premier online learning platform. Access live classes, interactive quizzes, assignments, and earn certificates from expert teachers.",
  "cta_primary": "Get Started Free",
  "cta_secondary": "Browse Courses"
}'),
('home', 'stats', '{
  "items": [
    {"label": "Active Students", "value": "10,000+"},
    {"label": "Courses", "value": "500+"},
    {"label": "Expert Teachers", "value": "200+"},
    {"label": "Certificates Issued", "value": "5,000+"}
  ]
}'),
('home', 'features', '{
  "badge": "Why Choose Us",
  "title": "Everything You Need to Succeed",
  "subtitle": "A complete learning management system designed for Ugandan students and teachers.",
  "items": [
    {"title": "Live Interactive Classes", "desc": "Real-time virtual classrooms with HD video and screen sharing"},
    {"title": "Structured Courses", "desc": "Well-organized curriculum with modules and lessons"},
    {"title": "Certificates", "desc": "Earn verifiable certificates upon course completion"},
    {"title": "Expert Teachers", "desc": "Learn from qualified and experienced instructors"},
    {"title": "Progress Tracking", "desc": "Monitor your learning journey with detailed analytics"},
    {"title": "Learn Anywhere", "desc": "Access courses on any device, anytime"}
  ]
}'),
('home', 'testimonials', '{
  "badge": "Testimonials",
  "title": "What People Say",
  "subtitle": "Hear from our community of learners and educators.",
  "items": [
    {"name": "Sarah Johnson", "role": "Student", "text": "Live Class Code transformed the way I learn. The interactive classes and quizzes keep me engaged.", "avatar": "SJ", "rating": 5},
    {"name": "James Mwangi", "role": "Teacher", "text": "The platform makes it easy to create courses and manage students. Highly recommended!", "avatar": "JM", "rating": 5},
    {"name": "Grace Nakato", "role": "Student", "text": "Live Class Code has transformed how I learn. The live classes and quizzes are fantastic.", "avatar": "GN", "rating": 5}
  ]
}'),
('home', 'cta', '{
  "badge": "Get Started Today",
  "title": "Ready to Start Learning?",
  "subtitle": "Join thousands of students already learning on Live Class Code. Start your journey today.",
  "button_text": "Get Started Free"
}');

-- ============================================
-- ABOUT PAGE
-- ============================================
INSERT INTO cms_pages (page, section, content) VALUES
('about', 'hero', '{
  "title": "About Live Class Code",
  "subtitle": "Empowering Ugandan education through technology. Live Class Code is a modern virtual classroom platform that connects students and teachers."
}'),
('about', 'mission', '{
  "title": "Our Mission",
  "body": "To make quality education accessible to every Ugandan student through technology. We provide tools for live classes, course management, assignments, quizzes, and progress tracking.",
  "image_url": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop"
}'),
('about', 'values', '{
  "items": [
    {"title": "Our Team", "desc": "Dedicated educators and technologists passionate about transforming education."},
    {"title": "Our Vision", "desc": "To be Uganda''s leading online learning platform serving students nationwide."},
    {"title": "Our Values", "desc": "Quality, accessibility, innovation, and community-driven education."}
  ]
}');

-- ============================================
-- FEATURES PAGE
-- ============================================
INSERT INTO cms_pages (page, section, content) VALUES
('features', 'hero', '{
  "title": "Platform Features",
  "subtitle": "Everything you need to run a successful online learning program."
}'),
('features', 'features', '{
  "items": [
    {"title": "Live Virtual Classrooms", "desc": "Real-time interactive classes with HD video, screen sharing, chat, and file sharing."},
    {"title": "Course Management", "desc": "Create structured courses with modules, lessons, videos, PDFs, and articles."},
    {"title": "Certificates", "desc": "Auto-generate verifiable certificates upon course completion with unique IDs."},
    {"title": "Multi-Role Support", "desc": "Dedicated portals for super admins, admins, teachers, and students."},
    {"title": "Assignments & Quizzes", "desc": "Create assignments and quizzes with auto-grading, multiple attempts, and feedback."},
    {"title": "Analytics & Reports", "desc": "Comprehensive reports on student progress, revenue, attendance, and course performance."},
    {"title": "Mobile Money Payments", "desc": "Integrated MTN MoMo and Airtel Money for seamless course payments."},
    {"title": "Real-Time Chat", "desc": "Built-in messaging system for students, teachers, and parents."},
    {"title": "Notifications", "desc": "In-app and email notifications for assignments, meetings, payments, and updates."},
    {"title": "Secure Authentication", "desc": "JWT tokens, 2FA, account locking, and session management for maximum security."},
    {"title": "Accessible Anywhere", "desc": "Responsive design works on desktop, tablet, and mobile devices."},
    {"title": "Progress Tracking", "desc": "Track lesson completion, quiz scores, assignment grades, and overall course progress."}
  ]
}');

-- ============================================
-- FAQ PAGE
-- ============================================
INSERT INTO cms_pages (page, section, content) VALUES
('faq', 'hero', '{
  "title": "Frequently Asked Questions",
  "subtitle": "Find answers to common questions about Live Class Code."
}'),
('faq', 'faqs', '{
  "items": [
    {"q": "What is Live Class Code?", "a": "Live Class Code is a comprehensive online learning management system designed for Ugandan students and teachers. It supports live classes, course management, assignments, quizzes, and mobile money payments."},
    {"q": "How do I enroll in a course?", "a": "Create an account, browse the course catalog, and click ''''Enroll Now'''' on any course. You can pay via MTN MoMo or Airtel Money."},
    {"q": "What payment methods are accepted?", "a": "We accept MTN Mobile Money and Airtel Money. Bank transfers and card payments coming soon."},
    {"q": "Can teachers create their own courses?", "a": "Yes! Teachers can create structured courses with modules, lessons, videos, PDFs, assignments, and quizzes."},
    {"q": "How do live classes work?", "a": "Teachers schedule live classes with HD video, screen sharing, and chat. Students receive reminders and join via a secure link."},
    {"q": "How are certificates issued?", "a": "Certificates are automatically generated when a student completes all course requirements. Each certificate has a unique verification number."},
    {"q": "Is my data secure?", "a": "Absolutely. We use JWT authentication, bcrypt password hashing, Helmet security headers, and SQL injection protection."}
  ]
}');

-- ============================================
-- PRICING PAGE
-- ============================================
INSERT INTO cms_pages (page, section, content) VALUES
('pricing', 'hero', '{
  "title": "Simple, Transparent Pricing",
  "subtitle": "Choose the plan that fits your needs"
}'),
('pricing', 'pricing', '{
  "plans": [
    {"name": "Free", "price": "0", "period": "forever", "features": ["Access to free courses", "Basic quizzes", "Course progress tracking", "Community forum access"], "cta": "Get Started", "featured": false},
    {"name": "Student", "price": "50,000", "period": "/month", "features": ["All free features", "Unlimited course access", "Live class participation", "Assignments & quizzes", "Certificate on completion", "Priority support"], "cta": "Start Learning", "featured": true},
    {"name": "Teacher", "price": "100,000", "period": "/month", "features": ["Create unlimited courses", "Student management", "Live class hosting", "Advanced analytics", "Payment integration", "Dedicated support"], "cta": "Start Teaching", "featured": false}
  ]
}');

-- ============================================
-- CONTACT PAGE
-- ============================================
INSERT INTO cms_pages (page, section, content) VALUES
('contact', 'hero', '{
  "title": "Contact Us",
  "subtitle": "We''d love to hear from you"
}'),
('contact', 'contact', '{
  "email": "info@liveclasscode.com",
  "support_email": "support@liveclasscode.com",
  "phone": "+256 700 000 000",
  "phone2": "+256 800 000 000",
  "address": "Kampala, Uganda",
  "address_detail": "Plot 123, Commercial Street"
}');

-- ============================================
-- BLOG PAGE
-- ============================================
INSERT INTO cms_pages (page, section, content) VALUES
('blog', 'hero', '{
  "title": "Our Blog",
  "subtitle": "Insights and updates from the Live Class Code team."
}'),
('blog', 'posts', '{
  "items": [
    {"title": "The Future of Online Learning in Uganda", "excerpt": "How digital education is transforming the Ugandan education landscape and creating new opportunities.", "author": "Admin", "date": "2024-01-15", "image": "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=250&fit=crop", "tag": "Education"},
    {"title": "Tips for Effective Online Teaching", "excerpt": "Best practices for teachers transitioning to virtual classrooms and engaging students remotely.", "author": "Teacher John", "date": "2024-01-10", "image": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=250&fit=crop", "tag": "Teaching"},
    {"title": "Why Mobile Money is Perfect for Education", "excerpt": "How MTN MoMo and Airtel Money are making education payments accessible to all Ugandans.", "author": "Admin", "date": "2024-01-05", "image": "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=250&fit=crop", "tag": "Payments"}
  ]
}');

-- ============================================
-- COURSES PAGE (shared by CourseCatalog + CourseDetail)
-- ============================================
INSERT INTO cms_pages (page, section, content) VALUES
('courses', 'hero', '{
  "title": "Explore Courses",
  "subtitle": "Discover courses from world-class teachers and unlock your potential",
  "cta_primary": "Browse Courses"
}');

-- ============================================
-- TEACHERS PAGE
-- ============================================
INSERT INTO cms_pages (page, section, content) VALUES
('teachers', 'hero', '{
  "title": "Meet Our Teachers",
  "subtitle": "Learn from experienced and qualified educators dedicated to your success"
}');

-- ============================================
-- CERTIFICATES PAGE
-- ============================================
INSERT INTO cms_pages (page, section, content) VALUES
('certificates', 'hero', '{
  "title": "Certificate Verification",
  "subtitle": "This certificate has been verified as authentic"
}');

-- ============================================
-- NOT FOUND PAGE
-- ============================================
INSERT INTO cms_pages (page, section, content) VALUES
('not-found', 'hero', '{
  "title": "Page Not Found",
  "subtitle": "The page you''re looking for doesn''t exist or has been moved.",
  "cta_primary": "Go Home",
  "cta_secondary": "Go Back"
}');

-- ============================================
-- PRIVACY POLICY PAGE
-- ============================================
INSERT INTO cms_pages (page, section, content) VALUES
('privacy-policy', 'hero', '{
  "title": "Privacy Policy",
  "updated": "Last updated: January 2024"
}'),
('privacy-policy', 'content', '{
  "sections": [
    {"heading": "Information We Collect", "body": "We collect information you provide directly to us, including your name, email address, phone number, and payment information when you register for an account or enroll in a course."},
    {"heading": "How We Use Your Information", "body": "We use your information to provide, maintain, and improve our services, process transactions, send notifications, and communicate with you about your account and courses."},
    {"heading": "Data Security", "body": "We implement appropriate security measures including encryption, secure socket layer technology, and regular security audits to protect your personal information."},
    {"heading": "Contact Us", "body": "If you have questions about this privacy policy, please contact us at privacy@liveclasscode.com."}
  ]
}');

-- ============================================
-- TERMS & CONDITIONS PAGE
-- ============================================
INSERT INTO cms_pages (page, section, content) VALUES
('terms-conditions', 'hero', '{
  "title": "Terms and Conditions",
  "updated": "Last updated: January 2024"
}'),
('terms-conditions', 'content', '{
  "sections": [
    {"heading": "Acceptance of Terms", "body": "By accessing and using Live Class Code, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our platform."},
    {"heading": "User Accounts", "body": "You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. Notify us immediately of any unauthorized use."},
    {"heading": "Course Enrollment", "body": "Enrollment in a course grants you access to the course materials for the duration specified. Sharing account access is prohibited."},
    {"heading": "Payments and Refunds", "body": "All payments are processed securely through MTN MoMo or Airtel Money. Refund requests are handled on a case-by-case basis."},
    {"heading": "Contact", "body": "For questions about these terms, contact legal@liveclasscode.com."}
  ]
}');
