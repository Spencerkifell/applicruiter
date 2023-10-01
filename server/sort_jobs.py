from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

import server

import MySQLdb.connections

similarityModel = SentenceTransformer('model')

jobs1 = ["We are looking for a person to make us a lasagne."]

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

            # Implement KNN to get the top maxResumeResults resumes.

            for i in range(min(maxResults, len(resumeSimilarityList))):
                resumeSimilarity = resumeSimilarityList[i]
                print(i + 1, ":", sep="")
                print('Resume:', resumeSimilarity[0])
                print('Similarity:', resumeSimilarity[1])
                print('')

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