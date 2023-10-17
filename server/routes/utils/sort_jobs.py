import json

from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

import routes.utils.pdf_processing as pdf_processing

import mysql.connector

similarityModel = SentenceTransformer('model')

jobs1 = ["We are looking for a person to make us a lasagne."]

db_config = {
    'host': 'localhost',
    'port': 3306,
    'user': 'root',
    'password': 'root',
    'database': 'MAIS2023'
}

class JobSorting:

    @staticmethod
    def rank_jobs(resumes):
        JobSorting.rank_jobs1(resumes, jobs1, 10)

    @staticmethod
    def rank_jobs1(resumes, jobs, maxResults):
        jobEmbeddings = similarityModel.encode(jobs)
        for job, jobEmbedding in zip(jobs, jobEmbeddings):
            jobEmbedding = jobEmbedding.reshape(1, -1)
            print('Job:', job)
            print('')
            resumeSimilarityList = []

            for resume in resumes:
                resumeContent = resume.get_pdf_content()
                resumeEmbedding = similarityModel.encode(resumeContent)
                resumeEmbedding = resumeEmbedding.reshape(1, -1)
                similarity = cosine_similarity(resumeEmbedding, jobEmbedding)[0][0]
                resumeSimilarityList.append((resumeContent, similarity))

            resumeSimilarityList.sort(key=lambda x: x[1], reverse=True)

            # Todo: Implement KNN to get the top maxResumeResults resumes.

            for i in range(min(maxResults, len(resumeSimilarityList))):
                resumeSimilarity = resumeSimilarityList[i]
                print(i + 1, ":", sep="")
                print('Resume:', resumeSimilarity[0])
                print('Similarity:', resumeSimilarity[1])
                print('')

    @staticmethod
    def rank_resumes(resumes, job, maxResults):
        resultRanking = dict()

        # Extract info from job data
        print(job)
        jobDesc = job[2]


        jobEmbedding = similarityModel.encode(jobDesc)
        jobEmbedding = jobEmbedding.reshape(1, -1)
        print('Job:', jobDesc)
        print('')
        resumeSimilarityList = []

        for resumeData in resumes:
            resume = pdf_processing.processPDF(resumeData[2], resumeData[3], resumeData[0])

            if resume.ranked:
                resumeContent = resume.get_pdf_content()
                resumeSimilarityList.append((resumeContent, resume.similarityScore, resume))
            else:
                resumeContent = resume.get_pdf_content()
                resumeEmbedding = similarityModel.encode(resumeContent)
                resumeEmbedding = resumeEmbedding.reshape(1, -1)
                similarity = cosine_similarity(resumeEmbedding, jobEmbedding)[0][0]
                resumeSimilarityList.append((resumeContent, similarity, resume))
                JobSorting.set_similarity_score(resumeData[0], float(similarity))



        resumeSimilarityList.sort(key=lambda x: x[1], reverse=True)

        # Implement KNN to get the top maxResumeResults resumes.

        for i in range(min(maxResults, len(resumeSimilarityList))):
            resumeSimilarity = resumeSimilarityList[i]
            print(i + 1, ":", sep="")
            print('Resume:', resumeSimilarity[0])
            print('Similarity:', resumeSimilarity[1])
            print('')

            resultRanking[i+1] = resumeSimilarityList[i][2].to_json()

        print(resultRanking)
        return json.dumps(resultRanking)

    @staticmethod
    def get_jobs():
        connection = JobSorting.get_connection()

        cursor = connection.cursor()

        query = "SELECT * FROM JOBS"
        cursor.execute(query)

        jobs = cursor.fetchall()

        cursor.close()
        connection.close()

        return jobs

    @staticmethod
    def get_connection():
        connection = mysql.connector.connect(
            host="your_host",
            user="your_user",
            password="your_password",
            database="MAIS2023"
        )
        return connection

    @staticmethod
    def set_similarity_score(resume_id, score):
        # Create a connection object
        connection = mysql.connector.connect(**db_config)

        # Create a cursor object to execute SQL queries
        cursor = connection.cursor()

        # Execute the SQL query to update the similarity score of the resume with the specified ID
        query = "UPDATE RESUMES SET SIMILARITY_SCORE = %s WHERE ID = %s"
        cursor.execute(query, (score, resume_id))

        # Commit the changes to the database
        connection.commit()

        # Close the cursor and database connection
        cursor.close()
        connection.close()

    @staticmethod
    def rank_resume(resumeData, job):
        print(1)
        jobDesc = job[2]
        print(2)
        jobEmbedding = similarityModel.encode(jobDesc)
        print(3)
        jobEmbedding = jobEmbedding.reshape(1, -1)
        print(4)

        resume = pdf_processing.processPDF(resumeData[2], resumeData[3], resumeData[0])

        if resume.ranked:
            return
        else:
            resumeContent = resume.get_pdf_content()
            resumeEmbedding = similarityModel.encode(resumeContent)
            resumeEmbedding = resumeEmbedding.reshape(1, -1)
            similarity = cosine_similarity(resumeEmbedding, jobEmbedding)[0][0]
            JobSorting.set_similarity_score(resumeData[0], similarity.astype(float))