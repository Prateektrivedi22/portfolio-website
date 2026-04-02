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
        document.querySelectorAll('a,button,.work-card,.specialty-item,.contact-pill').forEach(el=>{
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

    /* WORK CARD IMAGE PARALLAX */
    document.querySelectorAll('.work-card').forEach(card=>{
        card.addEventListener('mousemove',e=>{
            const r=card.getBoundingClientRect();
            const x=((e.clientX-r.left)/r.width-.5)*2;
            const y=((e.clientY-r.top)/r.height-.5)*2;
            const img=card.querySelector('img');
            if(img)img.style.transform=`scale(1.07) translate(${x*4}px,${y*4}px)`;
        });
        card.addEventListener('mouseleave',()=>{const img=card.querySelector('img');if(img)img.style.transform='';});
    });

        /* VIDEO MODAL */
    const modal=document.getElementById('video-modal');
    const iframe=document.getElementById('modal-iframe');
    const getEmbedUrl = (url) => {
        if (!url) return '';
        // If it's a Google Drive link, convert sharing link to preview link
        if (url.includes('drive.google.com')) {
            let fileId = '';
            const match = url.match(/\/file\/d\/(.+?)\/|\?id=(.+?)(&|$)/);
            if (match) {
                fileId = match[1] || match[2];
                return `https://drive.google.com/file/d/${fileId}/preview`;
            }
        }
        return url;
    };
    const openModal=url=>{
        const embedUrl = getEmbedUrl(url);
        iframe.src=embedUrl;
        modal.classList.add('active');
        document.body.style.overflow='hidden';
    };
    const closeModal=()=>{modal.classList.remove('active');setTimeout(()=>iframe.src='',400);document.body.style.overflow='';};
    document.querySelectorAll('.work-card').forEach(card=>{
        card.addEventListener('click',()=>{const url=card.getAttribute('data-video');if(url)openModal(url);});
    });
    document.querySelector('.modal-close')?.addEventListener('click',closeModal);
    document.querySelector('.modal-backdrop')?.addEventListener('click',closeModal);
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal?.classList.contains('active'))closeModal();});

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
