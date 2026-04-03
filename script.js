document.addEventListener('DOMContentLoaded', () => {

    /* CUSTOM CURSOR */
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');
    if (cursorDot && cursorRing && window.innerWidth > 768) {
        let mouseX=0,mouseY=0,ringX=0,ringY=0;
        document.addEventListener('mousemove', e => {
            mouseX=e.clientX; mouseY=e.clientY;
            cursorDot.style.left=mouseX+'px'; cursorDot.style.top=mouseY+'px';
        });
        const animCursor=()=>{ringX+=(mouseX-ringX)*.12;ringY+=(mouseY-ringY)*.12;cursorRing.style.left=ringX+'px';cursorRing.style.top=ringY+'px';requestAnimationFrame(animCursor);};
        animCursor();
        document.querySelectorAll('a,button,.v-card,.filter-btn,.specialty-item,.contact-pill').forEach(el=>{
            el.addEventListener('mouseenter',()=>document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave',()=>document.body.classList.remove('cursor-hover'));
        });
    }

    /* PARTICLE CANVAS */
    const canvas=document.getElementById('particleCanvas');
    if(canvas){
        const ctx=canvas.getContext('2d');
        canvas.width=window.innerWidth; canvas.height=window.innerHeight;
        const particles=Array.from({length:60},()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,r:Math.random()*1.2+.3,alpha:Math.random()*.4+.1}));
        const draw=()=>{
            ctx.clearRect(0,0,canvas.width,canvas.height);
            particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=canvas.width;if(p.x>canvas.width)p.x=0;if(p.y<0)p.y=canvas.height;if(p.y>canvas.height)p.y=0;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=`rgba(212,255,30,${p.alpha})`;ctx.fill();});
            for(let i=0;i<particles.length;i++){for(let j=i+1;j<particles.length;j++){const dx=particles[i].x-particles[j].x,dy=particles[i].y-particles[j].y,d=Math.sqrt(dx*dx+dy*dy);if(d<120){ctx.beginPath();ctx.moveTo(particles[i].x,particles[i].y);ctx.lineTo(particles[j].x,particles[j].y);ctx.strokeStyle=`rgba(212,255,30,${.06*(1-d/120)})`;ctx.lineWidth=.5;ctx.stroke();}}}
            requestAnimationFrame(draw);
        };
        draw();
        window.addEventListener('resize',()=>{canvas.width=window.innerWidth;canvas.height=window.innerHeight;});
    }

    /* NAVBAR */
    const navbar=document.getElementById('navbar');
    const navProgress=document.querySelector('.nav-progress');
    window.addEventListener('scroll',()=>{
        const pct=(window.scrollY/(document.documentElement.scrollHeight-window.innerHeight))*100;
        if(navProgress)navProgress.style.width=pct+'%';
        if(navbar)navbar.classList.toggle('scrolled',window.scrollY>50);
    },{passive:true});

    /* COUNTER ANIMATION */
    let started=false;
    const startCounters=()=>{
        if(started)return; started=true;
        document.querySelectorAll('.stat-number').forEach(el=>{
            const target=parseInt(el.getAttribute('data-target'));
            let cur=0; const step=target/(1500/16);
            const tick=()=>{cur+=step;if(cur<target){el.textContent=Math.floor(cur);requestAnimationFrame(tick);}else{el.textContent=target;}};
            tick();
        });
    };
    const heroObs=new IntersectionObserver(entries=>{if(entries[0].isIntersecting){setTimeout(startCounters,1800);heroObs.disconnect();}},{threshold:.5});
    const heroEl=document.querySelector('.hero');
    if(heroEl)heroObs.observe(heroEl);

    /* SCROLL REVEAL — handles reveal-up, reveal-left, reveal-right, reveal-col */
    const revealObs=new IntersectionObserver(entries=>{
        entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in-view');revealObs.unobserve(e.target);}});
    },{threshold:.08,rootMargin:'0px 0px -50px 0px'});
    document.querySelectorAll('.reveal-up,.reveal-left,.reveal-right,.reveal-col').forEach(el=>revealObs.observe(el));

    /* SPECIALTY ITEM STAGGER */
    const spItems=document.querySelectorAll('.specialty-item');
    spItems.forEach(item=>{item.style.opacity='0';item.style.transform='translateY(20px)';item.style.transition='opacity .4s ease,transform .4s ease';});
    const spGrid=document.querySelector('.specialty-grid');
    if(spGrid){
        const spObs=new IntersectionObserver(entries=>{
            entries.forEach(e=>{if(e.isIntersecting){spItems.forEach((item,i)=>setTimeout(()=>{item.style.opacity='1';item.style.transform='translateY(0)';},i*80));spObs.disconnect();}});
        },{threshold:.2});
        spObs.observe(spGrid);
    }

    /* CARD STAGGER REVEAL ON SCROLL */
    const allVCards = document.querySelectorAll('.v-card');

    // Assign stagger delay per card (cap at 20 so last cards don't wait too long)
    allVCards.forEach((card, i) => {
        card.style.setProperty('--stagger', `${Math.min(i, 20) * 0.055}s`);
    });

    const cardRevealObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('in-view');
                cardRevealObs.unobserve(e.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

    allVCards.forEach(c => cardRevealObs.observe(c));

    /* CATEGORY FILTER — animated transition */
    const filterBtns = document.querySelectorAll('.filter-btn');
    const vCards = allVCards;
    const videoGrid = document.getElementById('videoGrid');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('active')) return;
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');

            // Phase 1: fade out all currently visible cards
            const currentlyVisible = [...vCards].filter(c => !c.classList.contains('hidden'));
            currentlyVisible.forEach(card => {
                card.style.transition = 'opacity .18s ease, transform .18s ease';
                card.style.opacity = '0';
                card.style.transform = 'translateY(10px) scale(0.97)';
            });

            // Phase 2: after fade, swap visibility and stagger new cards in
            setTimeout(() => {
                let idx = 0;
                let hasVisible = false;

                vCards.forEach(card => {
                    const show = filter === 'all' || card.getAttribute('data-category') === filter;

                    // Reset any inline style overrides from phase 1
                    card.style.transition = '';
                    card.style.opacity = '';
                    card.style.transform = '';

                    if (show) {
                        card.classList.remove('hidden');
                        card.classList.remove('in-view');
                        const delay = `${idx * 0.07}s`;
                        card.style.setProperty('--stagger', delay);
                        // Nudge reflow so transition fires fresh
                        void card.offsetWidth;
                        card.classList.add('in-view');
                        idx++;
                        hasVisible = true;
                    } else {
                        card.classList.add('hidden');
                        card.classList.remove('in-view');
                    }
                });

                videoGrid?.classList.toggle('no-results', !hasVisible);
            }, 200);
        });
    });

    /* VIDEO MODAL — lazy-load iframe on click */
    const modal = document.getElementById('video-modal');
    const modalIframe = document.getElementById('modal-iframe');

    const modalDriveLink = document.getElementById('modal-drive-link');

    vCards.forEach(card => {
        card.addEventListener('click', () => {
            const videoUrl = card.getAttribute('data-video');
            const title = card.querySelector('h4')?.textContent || 'Video';
            if (videoUrl && modalIframe && modal) {
                // Use the /preview URL as-is — Google Drive does not support ?autoplay=1
                modalIframe.src = videoUrl;
                if (modalDriveLink) modalDriveLink.href = videoUrl.replace('/preview', '/view');
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    const closeModal = () => {
        if (!modal) return;
        modal.classList.remove('active');
        setTimeout(() => { if (modalIframe) modalIframe.src = ''; }, 400);
        document.body.style.overflow = '';
    };

    document.querySelector('.modal-close')?.addEventListener('click', closeModal);
    document.querySelector('.modal-backdrop')?.addEventListener('click', closeModal);
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && modal?.classList.contains('active')) closeModal();
    });


    /* SCROLL TOP */
    const scrollBtn=document.getElementById('scrollTopBtn');
    if(scrollBtn){
        window.addEventListener('scroll',()=>scrollBtn.classList.toggle('show',window.scrollY>400),{passive:true});
        scrollBtn.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
    }

    /* GLITCH on hero accent line */
    const accentLine=document.querySelector('.accent-line');
    if(accentLine)setInterval(()=>{
        if(Math.random()>.85){accentLine.style.textShadow=`${(Math.random()-.5)*6}px 0 rgba(212,255,30,0.8),${(Math.random()-.5)*6}px 0 rgba(255,59,92,0.5)`;setTimeout(()=>accentLine.style.textShadow='none',80);}
    },2000);

});
