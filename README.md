# Valentine Puzzle (3×3 Sliding Photo Puzzle) 💕

Upload a picture, it turns into a **3×3 sliding puzzle**, shuffles into a **solvable** state, and the player taps tiles to solve it.

## 🚀 How to Run (Choose One Method)

### Method 1: Double-click the server script (Easiest!)

**On Mac/Linux:**
- Double-click `start-server.sh` in Finder, or
- Right-click → Open With → Terminal

**On Windows:**
- Double-click `start-server.bat`

Then open your browser and go to: **http://localhost:8000**

---

### Method 2: Run from Terminal/Command Prompt

**On Mac/Linux:**
```bash
cd /Users/phillipfernandez/Desktop/valentineproject
./start-server.sh
```

**On Windows:**
```cmd
cd C:\Users\phillipfernandez\Desktop\valentineproject
start-server.bat
```

Then open: **http://localhost:8000**

---

### Method 3: Manual Python Server

```bash
cd /Users/phillipfernandez/Desktop/valentineproject
python3 -m http.server 8000
```

Then open: **http://localhost:8000**

---

### Method 4: Direct File Open (May have limitations)

- Right-click `index.html` → Open With → Your Browser
- Note: Some browsers may block file uploads when opened this way, so Method 1-3 are recommended.

---

## 🎮 How to Use

1. Click **"Upload a picture"** and select an image
2. Click **"Shuffle"** to scramble the puzzle
3. Click tiles next to the empty space to slide them
4. Solve the puzzle to see the complete image!

## 📝 How It Works

- Upload image → the app crops it to a centered square and scales it
- The image becomes the background of each tile; background positions reveal the correct slice
- Shuffle is done by performing random legal moves from the solved board, guaranteeing solvability

