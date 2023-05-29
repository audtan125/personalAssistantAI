# Welcome to my AI Personal Assistant project
I worked on the majority of the chat app functionality in a UNSW group project, however the personal assistant feature is my personal addition. 

**A video demo**: https://www.youtube.com/watch?v=FmpydeTm3k0 

## How to run this project

### Start the backend

Change your working directory to the server folder.

```bash
cd server
```

```bash
npm install
```

```bash
npm run start
```

### Start the frontend

Change your working directory to the client folder.

```bash
cd client
```

```bash
npm install
```

In a separate terminal to the backend run:
```bash
bash run-easy.sh 3 [BACKEND PORT]
```
Based on the current configurations, the command should be 

```bash
bash run-easy.sh 3 3000
```

Now you can navigate to http://localhost:3000.


## An Alternative Way

Start up the backend on a specific port.

Then run:
```bash
bash run.sh 3 [BACKEND PORT] [FRONTEND PORT]
```

For example:
```bash
bash run.sh 3 5000 12345
```

This project has been migrated from gitlab.
