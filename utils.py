import nltk
from nltk.tokenize import word_tokenize

def tokenize(sentence):
    return word_tokenize(sentence)

def to_lower(tokens):
    return [word.lower() for word in tokens]