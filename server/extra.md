**zID:** z5362329 (Audrey Tanama)
**Chosen bonus feature(s):** Added a personal assistant 'artificial intelligence' (but it's not really AI)
**Explanation (~100 words):**
I have implemented a 'personal assistant' that is basically a dm with a bot which is able to 
do things that the user requests. For example it is able to update user details and create channels just 
by sending a message into the personal assistant dm. It works in the backend by calling our existing functions 
when certain substrings appear in the message sent by the user into the personal assistant dm. It also 
includes a useage guide. The bot also handles errors by responding in a human way why the request is incorrect.

*Explanation of why it took 20+ hours:*
I have never coded in React before and I added a button which sends a POST request to my new personal 
assistant endpoint that creates the DM containing the personal assistant. 
Additionally, when the personal assistant creates a channel I wanted the frontend to automatically show the 
newly created channel rather than the user having to reload the page in order to see it. However since my 
personal assistant does everything within one message send dm request (otherwise will create a deadlock), 
the front end doesn't know that channels list has updated state because they were originally separate. 
I then had to learn what react states and contexts were so that React checks whether the list of channels 
have changed after a message has been sent into a dm.

*Other modifications:*
Modified upload profile image function so that you don't have to specify the dimensions of the image for cropping,
making it easy for the personal assistant to set a user's profile pic just by a url (image will just be uncropped).

**Frontend link:**
https://gitlab.cse.unsw.edu.au/z5362329/at-project-frontend 
To run front end use command
bash run.sh 3 [BACKEND PORT] [FRONTEND PORT]
eg
bash run.sh 3 3200 3000

**Link to Flipgrid video:**
https://flip.com/s/xy9uZzrMRyty
