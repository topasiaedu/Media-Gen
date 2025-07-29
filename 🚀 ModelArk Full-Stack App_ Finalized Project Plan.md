# **🚀 ModelArk Full-Stack App: Finalized Project Plan**

---

## **1️⃣ Tech Stack & High-Level Choices**

* **Frontend:** React (TypeScript), Tailwind CSS (or other styling), React Router

* **API Integration:** BytePlus ModelArk (Image & Video Generation)

* **Storage:** Supabase

* **CI/CD:** GitHub Actions (or similar)

* **Testing:** Jest, React Testing Library

* **Hosting:** Vercel (frontend), Supabase Cloud (Database)

---

## **2️⃣ Frontend: File/Folder Architecture**

bash  
CopyEdit  
`/src`  
  `/api`  
    `imageApi.ts         # Image Gen API interactions`  
    `videoApi.ts         # Video Gen API interactions`  
    `authApi.ts          # Auth-related API calls`  
  `/components`  
    `/Image`  
      `ImageGallery.tsx`  
      `ImageCard.tsx`  
    `/Video`  
      `VideoPlayer.tsx`  
      `VideoGallery.tsx`  
      `VideoUpload.tsx`  
    `/Prompt`  
      `PromptForm.tsx`  
      `PromptHistory.tsx`  
    `/User`  
      `Login.tsx`  
      `Signup.tsx`  
      `Profile.tsx`  
    `Loader.tsx`  
    `ErrorMessage.tsx`  
  `/pages`  
    `Home.tsx`  
    `LoginPage.tsx`  
    `ProfilePage.tsx`  
    `HistoryPage.tsx`  
    `VideoGenerationPage.tsx`  
  `/hooks`  
    `useAuth.ts`  
    `useImageGeneration.ts`  
    `useVideoGeneration.ts`  
    `usePromptHistory.ts`  
  `/types`  
    `api.ts             # API payload/response types`  
    `video.ts           # Video-specific types`  
    `user.ts`  
  `/utils`  
    `validators.ts`  
    `formatters.ts`  
  `/contexts`  
    `AuthContext.tsx`  
    `PromptContext.tsx`  
    `VideoContext.tsx`  
  `/assets`  
  `/styles`  
  `App.tsx`  
  `main.tsx`  
  `Index.html`  
  `database.types.ts    # Supabase generated`

---

## **3️⃣ TypeScript Data Models (Core Examples)**

### **Prompt Model**

`export interface Prompt {`  
  `id: string;`  
  `userId: string;`  
  `prompt: string;`  
  `createdAt: string;`  
  `modelUsed: string;`  
  `size: string;`  
  `guidanceScale: number;`  
  `type: 'image' | 'video';`  
`}`

### **Image Model**

`export interface GeneratedImage {`  
  `id: string;`  
  `promptId: string;`  
  `url: string;`  
  `createdAt: string;`  
  `size: string;`  
  `b64?: string;`  
`}`

### **Video Model**

`export interface VideoGenerationRequest {`  
  `model: string; // e.g. 'seedance-1-0-lite-t2v-250428'`  
  `content: Array<{`  
    `type: 'text' | 'image_url';`  
    `text?: string;`  
    `image_url?: { url: string };`  
  `}>;`  
`}`  
`export interface VideoGenerationTask {`  
  `id: string;`  
  `status: 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';`  
  `video_url?: string;`  
  `created_at: number;`  
  `updated_at: number;`  
`}`

---

## **4️⃣ Database Schema (Core Tables)**

* **prompts**: id, user\_id, prompt, language, created\_at, model\_used, type, size, guidance\_scale

* **images**: id, prompt\_id, url, created\_at, size, b64 (optional)

* **videos**: id, prompt\_id, url, status, created\_at, updated\_at, duration, aspect\_ratio

---

## **5️⃣ Frontend Core Flows & UI/UX**

* **Login/Signup/Profile:** Secure authentication, user settings, password reset

* **Prompt Submission:**

  * For image or video, let user select mode (radio/group)

* **Loading/Progress:** Show loader/spinner for image/video generation (especially for async video API)

* **Display Results:**

  * **Images:** Responsive gallery, preview, download, share

  * **Videos:** Preview (video player), download, share, progress status (poll until ready)

* **History:** Show user’s past prompts, images, and videos

* **Accessibility:** Keyboard nav, proper alt text, color contrast

---

# **✅ Your First Sprint: Step-by-Step**

1. **Implement Authentication (register, login, JWT)**

2. **Set up DB tables (users, prompts, images, videos)**

3. **Build Image Generation flow**

4. **Build Video Generation flow (async task polling)**

5. **Implement prompt/image/video history per user**

6. **Polish UI: Loader, error handling, responsive design**

7. **Write tests, set up CI/CD**

8. **Deploy (staging/production) and test in real-world conditions**

