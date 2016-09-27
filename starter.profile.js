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
		"title": "Internet Archive",
		"parser":"internetarchive",
	        "url":"https://archive.org",
		"subtitle": "The Internet Archive is a non-profit digital library of just about anything.",
		"categories": ["video", "image", "audio", "affiliated"]
	  },
      {
		"title": "Critical Commons",
		"parser":"criticalcommons",
	        "url":"http://criticalcommons.org",
		"subtitle": "For Fair &amp; Critical Participation in Media Culture",
		"categories": ["video", "image", "affiliated"]
	  }
   ]
});
