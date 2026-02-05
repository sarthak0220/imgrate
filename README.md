
# **Imgrate – Smart Image Optimization Service**

Imgrate is a **drop-in image optimization platform** that allows websites to accept images of any size and automatically compress them to a required size (for example, *“Image must be under 100 KB”*), without users needing to manually resize images.

It is designed for **real-world forms** such as:

* College admission portals
* Government forms
* Job applications
* Any website with strict image size limits

---

## 🚀 Key Features

* **Real-time Image Compression**
  Compresses images on upload to a target size (e.g. 50 KB, 100 KB, 300 KB).

* **Drop-in JavaScript Integration**
  Developers integrate Imgrate by adding a small script and configuration variables.

* **No Manual Image Editing Needed**
  Users can upload images of any size; Imgrate handles optimization automatically.

* **API-First Architecture**
  Exposes a `/optimize` API endpoint for image optimization.

* **Configurable Output Size**
  Target image size is controlled using `IMGRATE_MAX_SIZE_KB`.

* **Preview Control**
  Option to enable or disable image preview after optimization.

* **Node.js + FastAPI Architecture**

  * Node.js + Express → frontend server & upload handling
  * FastAPI (Python) → image compression logic

* **Production Ready**
  Can be deployed to platforms like **Render**, **Railway**, or **AWS**.

---

## 🛠 Tech Stack

* **Frontend / Integration**

  * HTML
  * Vanilla JavaScript (Drop-in JS)

* **Backend**

  * Node.js
  * Express.js
  * FastAPI (Python)

* **Image Processing**

  * Pillow (Python)

---

## 📂 Project Structure

```
imgrate/
├── main.py              # FastAPI backend (image optimization)
├── utils.py             # Image compression logic
├── server.js            # Node.js server (proxy + file handling)
├── requirements.txt     # Python dependencies
├── package.json         # Node dependencies
├── static/
│   ├── dropin.js        # Drop-in JS for developers
│   └── index.css
├── templates/
│   └── index.html       # Demo UI
├── uploads/             # Optimized images
└── README.md
```

---

## ⚙️ Prerequisites

Make sure you have the following installed:

* **Python 3.9+**
* **Node.js 18+**
* **pip**

Verify:

```bash
python --version
node -v
pip --version
```

---

## ▶️ How to Start the Project (Local Setup)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/imgrate.git
cd imgrate
```

---

### 2️⃣ Setup Python Virtual Environment

```bash
python -m venv venv
```

**Activate it**

Windows:

```bash
venv\Scripts\activate
```

Linux / macOS:

```bash
source venv/bin/activate
```

---

### 3️⃣ Install Python Dependencies

```bash
pip install -r requirements.txt
```

---

### 4️⃣ Start FastAPI Backend

```bash
python -m uvicorn main:app --reload --port 8000
```

FastAPI runs at:

```
http://127.0.0.1:8000
```

---

### 5️⃣ Start Node.js Server

Open a **new terminal**:

```bash
node server.js
```

Node server runs at:

```
http://localhost:3000
```

---

### 6️⃣ Test in Browser

Open:

```
http://localhost:3000
```

Upload an image → It gets compressed automatically.

---

## 🔌 How Developers Use Imgrate

### Step 1: Add Configuration

```html
<script>
  window.IMGRATE_MAX_SIZE_KB = 100;   // Target size
  window.IMGRATE_SHOW_PREVIEW = false;
</script>
```

---

### Step 2: Load Drop-in Script

```html
<script src="https://your-domain.com/static/dropin.js"></script>
```

---

### Step 3: Use File Input

```html
<input type="file" id="imgInput" accept="image/*" />
```

That’s it.
When a user selects an image, Imgrate automatically compresses it before upload.

---

## 📡 API Endpoint

### **POST `/optimize`**

**Query Parameters**

* `max_size_kb` – target output size in KB

**Form Data**

* `image` – image file

**Example**

```bash
curl -X POST "http://localhost:8000/optimize?max_size_kb=100" \
  -F "image=@photo.jpg"
```

---

## 🧪 Testing with Another HTML Page

Create a test file inside `templates/` and load:

```html
<script src="/static/dropin.js"></script>
```

Visit:

```
http://localhost:3000/test
```

---

## 🛑 Common Issues & Fixes

| Issue                  | Solution                                 |
| ---------------------- | ---------------------------------------- |
| `Python not found`     | Install Python and add to PATH           |
| `uvicorn path error`   | Recreate virtual environment             |
| Image not compressing  | Ensure FastAPI server is running         |
| `undefined path error` | Do not use `window` variables in backend |

---

## 📜 License

MIT License

---

## 🎯 One-Line Summary (For Resume / Viva)

> **Imgrate** is a drop-in image optimization service that automatically compresses uploaded images to strict size limits using Node.js and FastAPI.

---

