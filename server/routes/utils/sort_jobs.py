from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
from routes.utils.resume import Resume

similarityModel = SentenceTransformer('spencerkifell/applicruiter-model')

def rank_resumes(resumes, job_description):
    job_embedding = similarityModel.encode(job_description)
    job_embedding = job_embedding.reshape(1, -1)
    
    resumeSimilarityList = []

    for resume_data in resumes:
        id = resume_data.get("id")
        similarity_score = resume_data.get("similarity_score")
        pdf_location = resume_data.get("pdf_data")
        
        # If the resume already has a similarity score, skip it.
        if similarity_score and similarity_score != -1:
            continue
        
        resume = Resume(pdf_location, similarity_score, id)
        
        resumeContent = resume.get_pdf_content()
        resumeEmbedding = similarityModel.encode(resumeContent)
        resumeEmbedding = resumeEmbedding.reshape(1, -1)
        similarity = cosine_similarity(resumeEmbedding, job_embedding)[0][0]
        resumeSimilarityList.append((str(similarity), str(id)))

    return resumeSimilarityList
