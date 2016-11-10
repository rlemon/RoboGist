<img src="https://raw.githubusercontent.com/rlemon/RoboGist/master/logo-main.png" />  

RoboGist takes a gist ID and a [JavaScript Regular Expression](https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions) then injects all containing script or style files to the page matched by the regular expression.  

###Usage  
1) in the icon tray in chrome click on the new icon: <img src="https://raw.githubusercontent.com/rlemon/RoboGist/master/icon.png" /> and then click on the "Open Options page" orange icon (<img src="http://i.imgur.com/Y9UWh4q.png" />).    
2) on the Options page click on the "Add Gist" icon (<img src="http://i.imgur.com/jNzg90i.png" />).  
3) fill out the form. The name is a name you will identify for the gist, as gists do not have names. The ID is simply the gist ID (hash in the gist url) and the matches is a regular expression matching a url or a set of urls.    
4) After you've saved the gist you'll notice it is checked 'active' and its 'updated' date is the last commit on the gist. If the gist updates the active checkmark will be removed and you will see this icon: <img src="https://raw.githubusercontent.com/rlemon/RoboGist/master/icon-alt.png" />. Loading the options page will revert the icon back and give you an oppertunity to re-enable the updated gist. 

###Sample gist!  
https://gist.github.com/rlemon/7fd04fa87bb99589786f4b69e5dbb662  
Try installing it:  
option the options page, click on the "Add Gist" icon (<img src="http://i.imgur.com/jNzg90i.png" />) and enter the following:   
name: spinner  
id: 7fd04fa87bb99589786f4b69e5dbb662  
matching: .*