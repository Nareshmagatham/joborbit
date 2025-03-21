import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
    import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
    import { getFirestore, collection, addDoc, onSnapshot,getDocs } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

    const firebaseConfig = {
  apiKey: "AIzaSyAiC9z2r1i7hLtHSj1lKAt34UHtbNIc61A",
  authDomain: "jobboard-e500d.firebaseapp.com",
  projectId: "jobboard-e500d",
  storageBucket: "jobboard-e500d.firebasestorage.app",
  messagingSenderId: "360883607004",
  appId: "1:360883607004:web:30a4cd5100225d815e6b19",
  measurementId: "G-RFBJ0VPR76"
}
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    let userRole = "";

    document.getElementById('jobSeekerBtn').onclick = () => {
      userRole = "seeker";
      document.getElementById('auth-section').classList.remove('hidden');
    };

    document.getElementById('employerBtn').onclick = () => {
      userRole = "employer";
      document.getElementById('auth-section').classList.remove('hidden');
    };

    document.getElementById('registerBtn').onclick = () => {
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      createUserWithEmailAndPassword(auth, email, password)
        .then(() => { document.getElementById('auth-status').innerText = "✅ Registered"; })
        .catch(e => { document.getElementById('auth-status').innerText = e.message; });
    };

    document.getElementById('loginBtn').onclick = () => {
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          document.getElementById('auth-status').innerText = "✅ Logged In";
          showRoleUI();
        })
        .catch(e => { document.getElementById('auth-status').innerText = e.message; });
    };

    document.getElementById('logoutBtn').onclick = () => {
      signOut(auth).then(() => location.reload());
    };

    function showRoleUI() {
      if (userRole === "employer") {
        document.getElementById('post-job-section').classList.remove('hidden');
      }
      document.getElementById('search-jobs-section').classList.remove('hidden');
      fetchJobsRealtime();
    }

    document.getElementById('postBtn').onclick = async () => {
      const title = document.getElementById('jobTitle').value;
      const desc = document.getElementById('jobDesc').value;
      const location = document.getElementById('jobLocation').value;

      await addDoc(collection(db, "jobs"), { title, description: desc, location, postedAt: new Date() });
      document.getElementById('job-post-status').innerText = "✅ Job Posted!";
    };

    function fetchJobsRealtime() {
      const jobsRef = collection(db, "jobs");
      onSnapshot(jobsRef, (snapshot) => {
        let jobsHTML = '';
        snapshot.forEach((doc) => {
          const job = doc.data();
          jobsHTML += `
            <div class="job-card">
              <h3>${job.title}</h3>
              <p>${job.description}</p>
              <p><strong>Location:</strong> ${job.location}</p>
              <button onclick="applyJob('${job.location}')">Apply</button>
            </div>
          `;
        });
        document.getElementById('jobs-list').innerHTML = jobsHTML;
      });
    }

    // Global apply function
    window.applyJob = (location) => {
      const confirmRelocate = confirm(`Are you okay to relocate to ${location}?`);
      if (confirmRelocate) alert("✅ Application Successful!");
      else alert("❌ Application Cancelled");
    };

    // Search filter logic
    document.getElementById('searchInput').addEventListener('input', (e) => {
      const keyword = e.target.value.toLowerCase();
      const jobs = document.querySelectorAll('.job-card');
      jobs.forEach(job => {
        const text = job.innerText.toLowerCase();
        job.style.display = text.includes(keyword) ? 'block' : 'none';
      });
    });
    async function fetchJobsAPI() {
  try {
    const jobsRef = collection(db, "jobs");
    const snapshot = await getDocs(jobsRef);
    if (snapshot.empty) {
      console.log("No matching documents.");
      return;
    }
    let jobsHTML = '';
    snapshot.forEach((doc) => {
      const job = doc.data();
      jobsHTML += `
        <div class="job-card">
          <h3>${job.title}</h3>
          <p>${job.description}</p>
          <p><strong>Location:</strong> ${job.location}</p>
          <button onclick="applyJob('${job.location}')">Apply</button>
        </div>
      `;
    });
    document.getElementById('jobs-list').innerHTML = jobsHTML;
  } catch (error) {
    console.error("Error fetching jobs:", error);
  }
}

fetchJobsAPI();