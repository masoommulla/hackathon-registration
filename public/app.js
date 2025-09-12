// Hackathon Registration App JavaScript

// Application Data
const hackathonData = {
    hackathon: {
        name: "TECH HACKATHON 2025",
        description: "Join us for an innovative hackathon where technology meets creativity. Build solutions that shape the future.",
        date: "October 2025",
        duration: "48 hours"
    },
    prizes: {
        first: "₹40,000",
        second: "₹20,000", 
        third: "₹10,000",
        certificate: "Participation Certificate for all participants"
    },
    domains: [
        { id: "aiml", name: "Artificial Intelligence & Machine Learning (AI/ML)", icon: "🤖", problems: ["Fake News Detection", "Mental Health Chatbot", "Emotion Recognition System", "Personalized Learning Assistant", "Predictive Healthcare Analytics", "AI-Powered Resume Screener", "Smart Traffic Management", "Crop Disease Detection", "Personalized Recommendation Engine", "Speech-to-Sign Language Translator"] },
        { id: "iot", name: "Internet of Things (IoT) & Hardware", icon: "🌐", problems: ["Smart Waste Management", "Smart Home Energy Optimizer", "IoT-Based Flood Monitoring", "Industrial Equipment Fault Detection", "IoT-Powered Smart Farming", "Air Quality Monitoring System", "IoT-Based Elderly Care Assistant", "Vehicle Accident Detection & Alert System", "Smart Water Management System", "IoT-Based Wildlife Tracking"] },
        { id: "blockchain", name: "Blockchain & Web3", icon: "⛓️", problems: ["Blockchain-Based Voting System", "Decentralized Identity Verification", "Blockchain Supply Chain Tracking", "NFT-Based Certification System", "Blockchain for Land Record Management", "Decentralized Healthcare Records", "Cross-Border Payments with Blockchain", "Blockchain-Powered Crowdfunding", "Smart Contracts for Insurance Claims", "Decentralized File Storage"] },
        { id: "cybersecurity", name: "Cybersecurity", icon: "🔒", problems: ["AI-Based Phishing Detection", "Ransomware Early Detection System", "IoT Device Security Framework", "Secure Digital Identity System", "AI-Powered Intrusion Detection", "Passwordless Authentication System", "Real-Time Fraud Transaction Detection", "Cybersecurity Awareness Gamification", "Secure File-Sharing Platform", "Deepfake Detection Tool"] },
        { id: "cloud", name: "Cloud & DevOps", icon: "☁️", problems: ["Cloud Cost Optimization Tool", "Automated CI/CD Pipeline Generator", "Cloud Resource Usage Prediction", "Multi-Cloud Management Dashboard", "Auto-Scaling Infrastructure System", "Cloud Disaster Recovery Automation", "Real-Time Log Monitoring with Alerts", "AI-Powered Cloud Migration Assistant", "Serverless Workflow Orchestration", "DevSecOps Vulnerability Scanner"] }
    ]
};

// Global Variables
let currentPage = 0;
let selectedDomain = null;
let selectedProblem = null;
let scene, camera, renderer, particles = [];
let teamMemberCount = 0;
let mouseX = 0, mouseY = 0;

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initThreeJS();
    initCursorTrail();
    initNavigation();
    initScrollDetection();
    initEventListeners();
    animateElements();
});

// Three.js 3D Background
function initThreeJS() {
    const canvas = document.getElementById('three-canvas');
    if (!canvas) return;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    
    createFloatingParticles();
    createGeometricShapes();
    
    camera.position.z = 5;
    animate3D();
    
    window.addEventListener('resize', onWindowResize);
}

function createFloatingParticles() {
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 20;
        positions[i + 1] = (Math.random() - 0.5) * 20;
        positions[i + 2] = (Math.random() - 0.5) * 20;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({ color: 0x00ff88, size: 0.05, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
    
    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
    particles.push(particleSystem);
}

function createGeometricShapes() {
    for (let i = 0; i < 15; i++) {
        const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        const material = new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? 0x00ff88 : 0x0088ff, transparent: true, opacity: 0.3, wireframe: true });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 10);
        cube.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        scene.add(cube);
        particles.push(cube);
    }
    for (let i = 0; i < 10; i++) {
        const geometry = new THREE.SphereGeometry(0.1, 8, 6);
        const material = new THREE.MeshBasicMaterial({ color: 0x0088ff, transparent: true, opacity: 0.4, wireframe: true });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 8);
        scene.add(sphere);
        particles.push(sphere);
    }
}

function animate3D() {
    requestAnimationFrame(animate3D);
    particles.forEach((particle, index) => {
        if (particle.geometry && particle.geometry.attributes) { particle.rotation.y += 0.005; } 
        else { particle.rotation.x += 0.01; particle.rotation.y += 0.01; particle.position.y += Math.sin(Date.now() * 0.001 + index) * 0.001; }
    });
    camera.position.x += (mouseX * 0.001 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 0.001 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function initCursorTrail() {
    const cursorTrail = document.getElementById('cursor-trail');
    if (!cursorTrail) return;
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX - window.innerWidth / 2;
        mouseY = e.clientY - window.innerHeight / 2;
        cursorTrail.style.left = e.clientX - 10 + 'px';
        cursorTrail.style.top = e.clientY - 10 + 'px';
        createTrailParticle(e.clientX, e.clientY);
    });
}

function createTrailParticle(x, y) {
    const particle = document.createElement('div');
    particle.style.cssText = `position: fixed; left: ${x}px; top: ${y}px; width: 4px; height: 4px; background: radial-gradient(circle, #00ff88, transparent); border-radius: 50%; pointer-events: none; z-index: 9998; opacity: 0.8;`;
    document.body.appendChild(particle);
    let opacity = 0.8;
    const fadeOut = setInterval(() => {
        opacity -= 0.05;
        particle.style.opacity = opacity;
        if (opacity <= 0) {
            clearInterval(fadeOut);
            if (particle.parentNode) particle.parentNode.removeChild(particle);
        }
    }, 50);
}

function initNavigation() {
    const navDots = document.querySelectorAll('.nav-dot');
    navDots.forEach((dot, index) => dot.addEventListener('click', () => navigateToPage(index)));
}

function navigateToPage(pageIndex) {
    if (pageIndex === currentPage) return;
    const currentPageEl = document.querySelector('.page.active');
    const targetPageEl = document.getElementById(`page-${pageIndex + 1}`);
    const navDots = document.querySelectorAll('.nav-dot');
    if (!targetPageEl) return;
    navDots.forEach((dot, index) => dot.classList.toggle('active', index === pageIndex));
    if (currentPageEl) currentPageEl.classList.remove('active');
    setTimeout(() => {
        targetPageEl.classList.add('active');
        currentPage = pageIndex;
        targetPageEl.scrollTop = 0;
        if (pageIndex === 2) animateDomainCards();
        else if (pageIndex === 3) animateProblemCards();
    }, 150);
}

function initScrollDetection() {
    let isScrolling = false;
    document.addEventListener('wheel', (e) => {
        if (isScrolling || currentPage !== 0) return;
        const currentPageEl = document.querySelector('.page.active');
        if (currentPageEl && e.deltaY > 0) {
            isScrolling = true;
            navigateToPage(1);
            setTimeout(() => { isScrolling = false; }, 400);
        }
    });
    let touchStartY = 0;
    document.addEventListener('touchstart', (e) => { if (currentPage === 0) touchStartY = e.touches[0].clientY; });
    document.addEventListener('touchend', (e) => {
        if (currentPage === 0) {
            const diff = touchStartY - e.changedTouches[0].clientY;
            if (Math.abs(diff) > 50 && diff > 0) navigateToPage(1);
        }
    });
}

function initEventListeners() {
    const exploreBtn = document.querySelector('.explore-domains-btn');
    if (exploreBtn) exploreBtn.addEventListener('click', () => createTransitionEffect(() => navigateToPage(2)));
    const domainCards = document.querySelectorAll('.domain-card');
    domainCards.forEach(card => {
        card.addEventListener('click', () => {
            selectedDomain = hackathonData.domains.find(d => d.id === card.dataset.domain);
            createTransitionEffect(() => { displayProblems(); navigateToPage(3); });
        });
    });
    const registrationForm = document.getElementById('registration-form');
    if (registrationForm) registrationForm.addEventListener('submit', handleFormSubmission);
    for (let i = 0; i < 2; i++) addTeamMember();
}

function createTransitionEffect(callback) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: radial-gradient(circle at center, transparent 0%, #0a0a0a 70%); z-index: 9999; pointer-events: none; opacity: 0; transition: opacity 0.4s ease;`;
    document.body.appendChild(overlay);
    setTimeout(() => { overlay.style.opacity = '1'; }, 10);
    setTimeout(() => {
        callback();
        overlay.style.opacity = '0';
        setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 400);
    }, 200);
}

function displayProblems() {
    if (!selectedDomain) return;
    const titleEl = document.getElementById('selected-domain-title');
    const containerEl = document.getElementById('problems-container');
    titleEl.textContent = selectedDomain.name;
    containerEl.innerHTML = '';
    selectedDomain.problems.forEach((problem, index) => {
        const problemCard = document.createElement('div');
        problemCard.className = 'problem-card';
        problemCard.innerHTML = `<h3>${problem}</h3><p>Click to select this problem statement for your team</p>`;
        problemCard.addEventListener('click', () => {
            selectedProblem = problem;
            createTransitionEffect(() => { displayRegistrationSummary(); navigateToPage(4); });
        });
        containerEl.appendChild(problemCard);
        setTimeout(() => { problemCard.style.transform = 'translateY(0) scale(1)'; problemCard.style.opacity = '1'; }, index * 100);
    });
}

function displayRegistrationSummary() {
    if (!selectedDomain || !selectedProblem) return;
    document.getElementById('final-domain').textContent = selectedDomain.name;
    document.getElementById('final-problem').textContent = selectedProblem;
}

function addTeamMember() {
    if (teamMemberCount >= 3) return;
    teamMemberCount++;
    const membersContainer = document.getElementById('team-members');
    const memberDiv = document.createElement('div');
    memberDiv.className = 'team-member';
    memberDiv.innerHTML = `
        <div class="member-header">
            <h4 class="member-title">Team Member ${teamMemberCount}</h4>
            ${teamMemberCount > 0 ? `<button type="button" class="remove-member-btn" onclick="removeMember(this)">×</button>` : ''}
        </div>
        <div class="member-grid">
            <div class="form-group"><label class="form-label" for="member-${teamMemberCount}-name">Full Name</label><input type="text" class="form-control" id="member-${teamMemberCount}-name" name="member_${teamMemberCount}_name" required></div>
            <div class="form-group"><label class="form-label" for="member-${teamMemberCount}-usn">USN</label><input type="text" class="form-control" id="member-${teamMemberCount}-usn" name="member_${teamMemberCount}_usn" required></div>
            <div class="form-group"><label class="form-label" for="member-${teamMemberCount}-email">Email</label><input type="email" class="form-control" id="member-${teamMemberCount}-email" name="member_${teamMemberCount}_email" required></div>
            <div class="form-group"><label class="form-label" for="member-${teamMemberCount}-phone">Phone</label><input type="tel" class="form-control" id="member-${teamMemberCount}-phone" name="member_${teamMemberCount}_phone" required></div>
            <div class="form-group"><label class="form-label" for="member-${teamMemberCount}-college">College/Institution</label><input type="text" class="form-control" id="member-${teamMemberCount}-college" name="member_${teamMemberCount}_college" required></div>
        </div>`;
    membersContainer.appendChild(memberDiv);
}

function removeMember(button) {
    if (teamMemberCount <= 0) return;
    const memberDiv = button.closest('.team-member');
    memberDiv.remove();
    teamMemberCount--;
    const members = document.querySelectorAll('.team-member');
    members.forEach((member, index) => {
        const title = member.querySelector('.member-title');
        title.textContent = `Team Member ${index + 1}`;
        const inputs = member.querySelectorAll('input');
        inputs.forEach(input => {
            const name = input.name;
            if (name.startsWith('member')) {
                const parts = name.split('_');
                input.name = `member_${index + 1}_${parts.slice(2).join('_')}`;
                input.id = input.name; 
            }
        });
    });
    const addBtn = document.querySelector('.add-member-btn');
    if (teamMemberCount < 3) addBtn.style.display = 'block';
}

async function handleFormSubmission(e) {
    e.preventDefault();
    showLoading();
    try {
        const form = document.getElementById('registration-form');
        const formData = new FormData(form);

        // Leader ko pehla member banakar members array taiyaar karein
        const teamMembers = [{
            name: formData.get('leader_name') || '',
            email: formData.get('contact_email') || '', // Leader ka email, contact_email hai
            phone: formData.get('contact_phone') || '',
            role: 'Team Leader',
            skills: formData.get('leader_usn') || '' // USN ko skills mein bhej rahe hain
        }];

        // Baaki members ko collect karein
        for (let i = 1; i <= teamMemberCount; i++) {
            const name = formData.get(`member_${i}_name`);
            const email = formData.get(`member_${i}_email`);
            if (name && email) {
                teamMembers.push({
                    name: name,
                    email: email,
                    phone: formData.get(`member_${i}_phone`) || '',
                    role: 'Member',
                    skills: formData.get(`member_${i}_usn`) || '' // USN ko skills mein bhej rahe hain
                });
            }
        }
        
        // Server ko bhejne wala data
        const data = {
            teamName: formData.get('team_name'),
            selectedDomain: selectedDomain ? selectedDomain.name : 'Not Selected',
            selectedProblem: selectedProblem || 'Not Selected',
            institution: formData.get('institution'),
            contactEmail: formData.get('contact_email'),
            contactPhone: formData.get('contact_phone'),
            projectDescription: formData.get('project_description'),
            techStack: formData.get('tech_stack'),
            teamMembers: teamMembers
        };

        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        hideLoading();
        
        if (response.status === 201 && result.success) {
            showSuccessModal();
        } else {
            alert('Registration Failed: ' + (result.message || 'Unknown error occurred.'));
        }
    } catch (error) {
        hideLoading();
        console.error('Submission Error:', error);
        alert('An error occurred during submission. Please check the console.');
    }
}

function showLoading() {
    const loadingEl = document.getElementById('loading');
    if(loadingEl) loadingEl.classList.remove('hidden');
}

function hideLoading() {
    const loadingEl = document.getElementById('loading');
    if(loadingEl) loadingEl.classList.add('hidden');
}

function showSuccessModal() {
    const modal = document.getElementById('success-modal');
    if(modal) modal.classList.remove('hidden');
}

function closeModal() {
    const modal = document.getElementById('success-modal');
    if(modal) modal.classList.add('hidden');
    const form = document.getElementById('registration-form');
    if(form) form.reset();
    navigateToPage(0);
}

function animateElements() {}

function animateDomainCards() {
    const cards = document.querySelectorAll('.domain-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px) scale(0.9)';
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
        }, index * 100);
    });
}

function animateProblemCards() {
    const cards = document.querySelectorAll('.problem-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 50);
    });
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-member-btn')) addTeamMember();
});
