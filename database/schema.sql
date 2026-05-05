-- ============================================
-- StudyMart Database Schema
-- ============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'student', -- 'student' | 'admin'
  phone TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL, -- 'Class 10', 'Class 12'
  description TEXT
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  class_id INTEGER REFERENCES classes(id),
  name TEXT NOT NULL, -- 'Mathematics', 'Physics', etc.
  code TEXT,          -- 'MATH', 'PHY', etc.
  icon TEXT
);

-- Chapters table
CREATE TABLE IF NOT EXISTS chapters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject_id INTEGER REFERENCES subjects(id),
  chapter_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT
);

-- Notes table (typed/printed notes)
CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chapter_id INTEGER REFERENCES chapters(id),
  title TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL DEFAULT 0,
  is_free INTEGER DEFAULT 0,
  pdf_path TEXT,         -- path to PDF file
  preview_path TEXT,     -- path to preview image
  pages INTEGER,
  downloads INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Handwritten Notes table
CREATE TABLE IF NOT EXISTS handwritten_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chapter_id INTEGER REFERENCES chapters(id),
  title TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL DEFAULT 0,
  is_free INTEGER DEFAULT 0,
  pdf_path TEXT,
  preview_path TEXT,
  author_name TEXT,      -- name of the student/teacher who wrote
  pages INTEGER,
  downloads INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Previous Year Question Papers
CREATE TABLE IF NOT EXISTS pyq_papers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject_id INTEGER REFERENCES subjects(id),
  year INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL DEFAULT 0,
  is_free INTEGER DEFAULT 0,
  pdf_path TEXT,
  preview_path TEXT,
  board TEXT DEFAULT 'CBSE',   -- 'CBSE', 'ICSE', etc.
  exam_type TEXT DEFAULT 'Board', -- 'Board', 'Midterm', 'Unit Test'
  solutions_included INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cart table
CREATE TABLE IF NOT EXISTS cart_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  item_type TEXT NOT NULL, -- 'note' | 'handwritten' | 'pyq'
  item_id INTEGER NOT NULL,
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, item_type, item_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  total_amount REAL NOT NULL,
  payment_status TEXT DEFAULT 'pending', -- 'pending' | 'paid' | 'failed'
  payment_id TEXT,       -- Razorpay payment ID
  order_id TEXT,         -- Razorpay order ID
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER REFERENCES orders(id),
  item_type TEXT NOT NULL,
  item_id INTEGER NOT NULL,
  price_paid REAL NOT NULL
);

-- Purchased items (access control)
CREATE TABLE IF NOT EXISTS user_purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  item_type TEXT NOT NULL,
  item_id INTEGER NOT NULL,
  order_id INTEGER REFERENCES orders(id),
  purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, item_type, item_id)
);

-- ============================================
-- Seed Data
-- ============================================

INSERT OR IGNORE INTO classes (id, name, description) VALUES
  (1, 'Class 10', 'CBSE Class 10 - Secondary Education'),
  (2, 'Class 12', 'CBSE Class 12 - Senior Secondary Education');

-- Class 10 Subjects
INSERT OR IGNORE INTO subjects (id, class_id, name, code, icon) VALUES
  (1, 1, 'Mathematics', 'MATH', '📐'),
  (2, 1, 'Science', 'SCI', '🔬'),
  (3, 1, 'Social Science', 'SST', '🌍'),
  (4, 1, 'English', 'ENG', '📚'),
  (5, 1, 'Hindi', 'HIN', '🔤');

-- Class 12 Subjects
INSERT OR IGNORE INTO subjects (id, class_id, name, code, icon) VALUES
  (6, 2, 'Physics', 'PHY', '⚛️'),
  (7, 2, 'Chemistry', 'CHEM', '🧪'),
  (8, 2, 'Mathematics', 'MATH', '📐'),
  (9, 2, 'Biology', 'BIO', '🧬'),
  (10, 2, 'English', 'ENG', '📚'),
  (11, 2, 'Computer Science', 'CS', '💻'),
  (12, 2, 'Accountancy', 'ACC', '📊'),
  (13, 2, 'Business Studies', 'BST', '💼'),
  (14, 2, 'Economics', 'ECO', '📈');

-- Class 10 Maths Chapters
INSERT OR IGNORE INTO chapters (id, subject_id, chapter_number, title) VALUES
  (1, 1, 1, 'Real Numbers'),
  (2, 1, 2, 'Polynomials'),
  (3, 1, 3, 'Pair of Linear Equations'),
  (4, 1, 4, 'Quadratic Equations'),
  (5, 1, 5, 'Arithmetic Progressions'),
  (6, 1, 6, 'Triangles'),
  (7, 1, 7, 'Coordinate Geometry'),
  (8, 1, 8, 'Introduction to Trigonometry'),
  (9, 1, 9, 'Applications of Trigonometry'),
  (10, 1, 10, 'Circles'),
  (11, 1, 11, 'Areas Related to Circles'),
  (12, 1, 12, 'Surface Areas and Volumes'),
  (13, 1, 13, 'Statistics'),
  (14, 1, 14, 'Probability');

-- Class 10 Science Chapters
INSERT OR IGNORE INTO chapters (id, subject_id, chapter_number, title) VALUES
  (15, 2, 1, 'Chemical Reactions and Equations'),
  (16, 2, 2, 'Acids, Bases and Salts'),
  (17, 2, 3, 'Metals and Non-metals'),
  (18, 2, 4, 'Carbon and its Compounds'),
  (19, 2, 5, 'Life Processes'),
  (20, 2, 6, 'Control and Coordination'),
  (21, 2, 7, 'How do Organisms Reproduce'),
  (22, 2, 8, 'Heredity'),
  (23, 2, 9, 'Light - Reflection and Refraction'),
  (24, 2, 10, 'Human Eye and Colourful World'),
  (25, 2, 11, 'Electricity'),
  (26, 2, 12, 'Magnetic Effects of Electric Current'),
  (27, 2, 13, 'Our Environment');

-- Class 12 Physics Chapters
INSERT OR IGNORE INTO chapters (id, subject_id, chapter_number, title) VALUES
  (50, 6, 1, 'Electric Charges and Fields'),
  (51, 6, 2, 'Electrostatic Potential and Capacitance'),
  (52, 6, 3, 'Current Electricity'),
  (53, 6, 4, 'Moving Charges and Magnetism'),
  (54, 6, 5, 'Magnetism and Matter'),
  (55, 6, 6, 'Electromagnetic Induction'),
  (56, 6, 7, 'Alternating Current'),
  (57, 6, 8, 'Electromagnetic Waves'),
  (58, 6, 9, 'Ray Optics and Optical Instruments'),
  (59, 6, 10, 'Wave Optics'),
  (60, 6, 11, 'Dual Nature of Radiation and Matter'),
  (61, 6, 12, 'Atoms'),
  (62, 6, 13, 'Nuclei'),
  (63, 6, 14, 'Semiconductor Electronics');

-- Class 12 Chemistry Chapters
INSERT OR IGNORE INTO chapters (id, subject_id, chapter_number, title) VALUES
  (70, 7, 1, 'The Solid State'),
  (71, 7, 2, 'Solutions'),
  (72, 7, 3, 'Electrochemistry'),
  (73, 7, 4, 'Chemical Kinetics'),
  (74, 7, 5, 'Surface Chemistry'),
  (75, 7, 6, 'General Principles of Isolation of Elements'),
  (76, 7, 7, 'The p-Block Elements'),
  (77, 7, 8, 'The d and f Block Elements'),
  (78, 7, 9, 'Coordination Compounds'),
  (79, 7, 10, 'Haloalkanes and Haloarenes'),
  (80, 7, 11, 'Alcohols, Phenols and Ethers'),
  (81, 7, 12, 'Aldehydes, Ketones and Carboxylic Acids'),
  (82, 7, 13, 'Amines'),
  (83, 7, 14, 'Biomolecules'),
  (84, 7, 15, 'Polymers'),
  (85, 7, 16, 'Chemistry in Everyday Life');

-- Sample Notes
INSERT OR IGNORE INTO notes (id, chapter_id, title, description, price, is_free, pages) VALUES
  (1, 1, 'Real Numbers Complete Notes', 'Euclid algorithm, HCF, LCM, irrational numbers', 29, 0, 18),
  (2, 2, 'Polynomials Notes', 'Zeroes, division algorithm, graphical representation', 29, 0, 14),
  (3, 3, 'Linear Equations Notes', 'Substitution, elimination, cross multiplication', 29, 0, 20),
  (4, 8, 'Trigonometry Notes', 'All ratios, identities, complementary angles', 35, 0, 22),
  (5, 15, 'Chemical Reactions Notes', 'Types of reactions, balancing equations', 35, 0, 16),
  (6, 50, 'Electric Charges & Fields', 'Coulombs law, electric field, Gauss law', 49, 0, 28),
  (7, 52, 'Current Electricity Notes', 'Ohms law, Kirchhoff laws, Wheatstone bridge', 49, 0, 30);

-- Sample Handwritten Notes
INSERT OR IGNORE INTO handwritten_notes (id, chapter_id, title, description, price, is_free, author_name, pages) VALUES
  (1, 1, 'Real Numbers - Handwritten', 'Clear handwritten notes with solved examples', 19, 0, 'Priya Sharma', 12),
  (2, 8, 'Trigonometry Handwritten', 'All formulas with tricks and mnemonics', 19, 0, 'Rahul Verma', 15),
  (3, 50, 'Electrostatics Handwritten', 'Detailed handwritten with diagrams', 39, 0, 'Anjali Singh', 20),
  (4, 52, 'Current Electricity Handwritten', 'Circuit diagrams and derivations', 39, 0, 'Rahul Verma', 18);

-- Sample PYQ Papers
INSERT OR IGNORE INTO pyq_papers (id, subject_id, year, title, description, price, is_free, board, solutions_included) VALUES
  (1, 1, 2024, 'Class 10 Maths 2024', 'CBSE Board Exam 2024 with solutions', 49, 0, 'CBSE', 1),
  (2, 1, 2023, 'Class 10 Maths 2023', 'CBSE Board Exam 2023 with solutions', 49, 0, 'CBSE', 1),
  (3, 2, 2024, 'Class 10 Science 2024', 'CBSE Board Exam 2024 with solutions', 49, 0, 'CBSE', 1),
  (4, 6, 2024, 'Class 12 Physics 2024', 'CBSE Board Exam 2024 with solutions', 59, 0, 'CBSE', 1),
  (5, 7, 2024, 'Class 12 Chemistry 2024', 'CBSE Board Exam 2024 with solutions', 59, 0, 'CBSE', 1),
  (6, 8, 2024, 'Class 12 Maths 2024', 'CBSE Board Exam 2024 with solutions', 59, 0, 'CBSE', 1),
  (7, 1, 2022, 'Class 10 Maths 2022', 'CBSE Board Exam 2022 with solutions', 39, 0, 'CBSE', 1),
  (8, 6, 2023, 'Class 12 Physics 2023', 'CBSE Board Exam 2023 with solutions', 59, 0, 'CBSE', 1);

-- Admin user (password: admin123)
INSERT OR IGNORE INTO users (id, name, email, password_hash, role) VALUES
  (1, 'Admin', 'admin@studymart.com', '$2b$10$rQ5V5.3KlnxV3mPqS9Z4/.gS1qfmMpJV.GC6D.JyLnz7uPbhWXdMi', 'admin');
