let qoutes = [

    'আত্মতৃপ্তিতে ভোগা সংকীর্ণ জ্ঞানের পরিচয়।',
    'মূর্খতার মত দরিদ্রতা আর জ্ঞানের মত সম্পদ কিছু নেই',
    'যতই আমরা অধ্যয়ন করি, ততই আমাদের অজ্ঞতাকে আবিষ্কার করি। – শেলি',
    'ভূল করা দোষের কথা নয় বরং ভূলের উপর প্রতিষ্ঠিত থাকা দোষণীয়।',
    '“শরীরকে আরামে রেখে জ্ঞানার্জন করা সম্ভব নয়।”- ইমাম মুসলিম',
    'পৃথিবীটা লবণাক্ত পানির মত। যতই তা পান করবে পিপাসা ততই বাড়বে।',
    'চিরকাল অন্ধকারকে গালমন্দ না করে ছোট্ট একটি বাতি জ্বালানো অনেক ভাল।',
    'ভালো বই পড়া মানে গত শতাব্দীর সেরা মানুষদের সাথে কথা বলা -দেকার্তে',
    'ভালো খাদ্য বস্তু পেট ভরে কিন্ত ভাল বই মানুষের আত্মাকে পরিতৃপ্ত করে।- স্পিনোজা',
];

document.getElementById("qoutes").innerHTML = qoutes[0];
setInterval( () => {

    let ind =  Math.floor(Math.random() * 9) ;
    let qoute = qoutes[ind];

    document.getElementById("qoutes").innerHTML = qoute;
}, 5000);