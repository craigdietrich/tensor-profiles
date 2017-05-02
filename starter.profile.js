profile({
	"name":"Starter Profile",
	"uri":"https://raw.githubusercontent.com/craigdietrich/tensor-profiles/master/starter.profile.js",
	"archives": [
	{
		"title": "YouTube",
		"parser":"youtube",
		"url":"https://www.googleapis.com/youtube/v3",
		"subtitle": "Hosts user-generated videos. Includes network and professional content.",
		"categories": ["video"]
	}, 
	{
		"title": "Vimeo",
		"parser":"vimeo",
		"url":"https://api.vimeo.com",
		"subtitle": "Upload, store, share and manage HD videos.",
		"categories": ["video"]
	},
	{
		"title": "SoundCloud",
		"parser":"soundcloud",
		"url":"https://soundcloud.com",
		"subtitle": "Audio platform of shared music and sounds.",
		"categories": ["audio"]
	},
	{
		"title": "Flickr",
		"parser":"flickr",
		"url":"https://www.flickr.com/",
		"subtitle": "Picture galleries available with social networking, chat, groups, and photo ratings.",
		"categories": ["image","video"]
	},
	{
		"title": "Internet Archive",
		"parser":"internetarchive",
		"url":"https://archive.org",
		"subtitle": "A non-profit digital library of just about anything.",
		"categories": ["video", "image", "audio", "affiliated"]
	},
	{
		"title": "Critical Commons",
		"parser":"criticalcommons",
		"url":"http://criticalcommons.org",
		"subtitle": "For Fair &amp; Critical Participation in Media Culture",
		"categories": ["video", "image", "affiliated"]
	},
	{
		"title": "TriArte Art and Artifacts Database",
		"parser":"triarte",
		"url":"http://triarte.brynmawr.edu",
		"subtitle": "TriArte features over 33,500 art and artifacts from Bryn Mawr, Haverford, and Swarthmore Colleges.",
		"categories": ["image"],
	},
	{
		"title": "Complex TV",
		"parser":"scalar",
		"url":"http://scalar.usc.edu/works/complex-television",
		"subtitle": "Scalar book complementing Jason Mittell's Complex TV: The Poetics of Contemporary Television Storytelling (NYU Press, 2015).",
		"categories": ["video", "affiliated"],
		"thumbnail": "http://scalar.usc.edu/works/complex-television/media/book_thumbnail.jpg"
	},
	{
		"title": "History 355 collaboration with Moore Lab",
		"parser":"crossroads",
		"url":"https://crossroads.oxy.edu/projects/300",
		"subtitle": "Crossroads project on what can we learn about Nahua ('Aztec') knowledge, culture, society, and economy using ethnohistorical and biological evidence?",
		"categories": ["image"]
	},
	{
		"title": "Histories of the National Mall",
		"parser":"omeka",
		"url":"http://mallhistory.org",
		"subtitle": "Omeka archive with historical maps, stories, people and historical events related to the Mall's past.",
		"categories": ["image"],
		"thumbnail": "http://mallhistory.org/files/theme_uploads/e7ba5426e00e4fe9af499a6ce0731a4f.png"
	},
	{
		"title": "Trans-Atlantic Slave Trade Database",
		"parser":"django-images",
		"url":"http://www.slavevoyages.org",
		"subtitle": "Information on almost 36,000 slaving voyages that forcibly embarked over 10 million Africans for transport to the Americas between the sixteenth and nineteenth centuries.",
		"categories": ["image"]
	}
	],
        "collections":[
	{
		"title":"Starter profile imports",
		"description":"Items from starter profile archives",
		"color":"#5cb85c"
	}
        ]
});
