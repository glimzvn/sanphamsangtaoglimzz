class Question {
    constructor(answer_no, image, option1, option2, option3, option4, question, topic_id){
        this.answer_no=answer_no;
        this.image=image;
        this.option1=option1;
        this.option2=option2;
        this.option3=option3;
        this.option4=option4;
        this.question=question;
        this.topic_id=topic_id;
    }
}

class Topic {
    constructor(image, name){
        this.image = image;
        this.name = name;
    }
}