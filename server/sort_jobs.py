from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

similarityModel = SentenceTransformer('model')

jobs1 = ["We are looking for a person to make us a lasagne."]

maxResumeResults = 10;

class JobSorting:

    @staticmethod
    def rank_jobs(resumes):
        JobSorting.rank_jobs1(resumes, jobs1)

    @staticmethod
    def rank_jobs1(resumes, jobs):
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

            for i in range(min(maxResumeResults, len(resumeSimilarityList))):
                resumeSimilarity = resumeSimilarityList[i]
                print(i + 1, ":", sep="")
                print('Resume:', resumeSimilarity[0])
                print('Similarity:', resumeSimilarity[1])
                print('')


