from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
from transformers import pipeline
from pdf_process.resume import *

similarityModel = SentenceTransformer('multi-qa-mpnet-base-dot-v1')
# sentimentAnalysisModel = pipeline('sentiment-analysis', 'distilbert-base-uncased-finetuned-sst-2-english')

jobs1 = ["We are looking for a frontend programmer."]

resumes1 = ["I am a programmer who can do frontend.",
           "Banana-eating world champion 2013-2023. One decade, baby.",
           "I am a programmer who can do backend.",
           "I am a programmer who can do frontend and backend.",
           "I have done an intro to Python class!",
           "I am a programmer who who knows Angular, with 20 years of experience.",
           "I designed and coded a website for my friend's business."]



'''
# Sentiment analysis
for resume in resumes:
    sentimentResult = sentimentAnalysisModel(resume)
    print(sentimentResult[0]['label'], sentimentResult[0]['score'])
'''

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


