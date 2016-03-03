<img src="http://i.imgur.com/4fV2tTL.png" />  

RoboGist takes a gist ID and a [JavaScript Regular Expression](https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions) then injects all containing script or style files to the page matched by the regular expression.  

###Usage  
1) in the icon tray in chrome click on the new icon: <img src="http://i.imgur.com/HwexOjX.gif" /> and then click on the "Open Options page" orange icon (<img src="http://i.imgur.com/Y9UWh4q.png" />).  
2) on the Options page click on the "Add Gist" icon (<img src="http://i.imgur.com/jNzg90i.png" />).
3) fill out the form. The name is a name you will identify for the gist, as gists do not have names. The ID is simply the gist ID (hash in the gist url) and the matches is a regular expression matching a url or a set of urls.  
4) After you've saved the gist you'll notice it is checked 'active' and its 'updated' date is right now.. This is expected. The first time the gist runs (and subsequently downloaded) that number will update. 

*Note!* if you see this icon: <img src="http://i.imgur.com/Fs2WtqJ.png" />   
that means a gist has one or more files which have been altered since you last activated it. You will have to open the popup page or the options page to re-enable it.  

As of right now active gists do not inject themselves on-the-fly, they need a page load to do so. Expect this to change.  

###Development Installation  
1) download the source and `cd` to the directory
2) run `npm install`
3) run `npm run-script build` 
4) open `chrome://extensions` and load the unpackaged extension found in the newly created `/build` directory. 