# TalentWave
## A Different Approach to Automated Tracking Systems for Businesses

### Summary
- TalentWave.AI is an application powered by machine learning that streamlines the resume screening process by efficiently categorizing and assessing resumes submitted for job openings.

### What it does
- Our solution was designed using a combination of technologies. On the backend, we used Python, leveraging the sentence_transformers library integrated with PyTorch. We took the extra step of fine-tuning the all-mpnet-base-v2 model using a comprehensive dataset of resumes. Additionally, we employed the pdfplumber library to seamlessly extract text from PDF resumes. The data, along with job descriptions, was stored in an SQL database, ensuring accessibility and organization.
- On the frontend, we used Angular.js, coupled with the Material UI framework, to create a user-friendly interface for TalentWave.AI. This dynamic front-end interface seamlessly interacts with the backend, providing real-time updates for each job posting created. The use of RX.js allowed us to use observables, enabling our application to dynamically respond to changes in job postings. This means that as new job postings are created or updated, the interface automatically updates in real-time, providing an efficient and intuitive user experience.
- We also incorporated Flask, a micro web framework for Python. Flask served as the bridge that seamlessly connected our machine learning backend with the frontend. It allowed us to create a responsive and efficient web application that can handle incoming requests, process data, and deliver results.

### Chalenges we ran into
- This project was mainly developed under a 24 hour time constraint, so initially we didn't have time to polish it as much as we hoped to.
- While developing TalentWave.AI, we encountered a significant challenge during the fine-tuning process. Initially, the model was producing many NaN (Not-a-Number) results, which confused us. It required several hours of dedicated effort to find the issue, but we ultimately resolved the problem with persistence.

### Links to Resources
- Since the model and datasets are too large to store in the directory of the project, this [dropbox](https://www.dropbox.com/scl/fo/7de8b34pyec5190mfmcgj/h?rlkey=fff5wx1bl5ru73danvfzzzidf&dl=0) link contains them both.
- Please make sure to extract them in the server directory for the project to run.

