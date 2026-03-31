import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Text "mo:core/Text";
import Iter "mo:core/Iter";

actor {
  type Lesson = {
    id : Text;
    title : Text;
    description : Text;
    starterCode : Text;
    solutionPattern : Text;
    quiz : {
      question : Text;
      options : [Text];
      correctIndex : Nat;
    };
  };

  type Module = {
    id : Text;
    name : Text;
    lessons : [Lesson];
  };

  type UserProgress = {
    completedLessons : [Text];
    quizScores : [(Text, Bool)];
  };

  module UserProgress {
    public func compare(progress1 : UserProgress, progress2 : UserProgress) : Order.Order {
      Nat.compare(progress1.completedLessons.size(), progress2.completedLessons.size());
    };
  };

  let htmlModules : [Module] = [
    {
      id = "module1";
      name = "HTML Basics";
      lessons = [
        {
          id = "lesson1";
          title = "Introduction to HTML";
          description = "Learn what HTML is and how it works.";
          starterCode = "<!DOCTYPE html>\n<html>\n  <head>\n    <title>My First Page</title>\n  </head>\n  <body>\n  </body>\n</html>";
          solutionPattern = "<!DOCTYPE html>";
          quiz = {
            question = "What does HTML stand for?";
            options = ["Hyper Text Markup Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language", "Hyperlinking Text Mark Language"];
            correctIndex = 0;
          };
        },
        {
          id = "lesson2";
          title = "Basic Structure";
          description = "Learn about the basic structure of an HTML document.";
          starterCode = "<html>\n  <head>\n  </head>\n  <body>\n  </body>\n</html>";
          solutionPattern = "<body>";
          quiz = {
            question = "Which tag is used for the main content?";
            options = ["<content>", "<main>", "<body>", "<section>"];
            correctIndex = 2;
          };
        },
      ];
    },
    {
      id = "module2";
      name = "HTML Elements";
      lessons = [
        {
          id = "lesson3";
          title = "Headings and Paragraphs";
          description = "Learn about headings and paragraph tags.";
          starterCode = "<body>\n  <h1></h1>\n  <p></p>\n</body>";
          solutionPattern = "<h1>";
          quiz = {
            question = "Which tag is used for the largest heading?";
            options = ["<heading>", "<h6>", "<h1>", "<head>"];
            correctIndex = 2;
          };
        },
      ];
    },
  ];

  let completedLessons = Map.empty<Text, Bool>();
  let quizScores = Map.empty<Text, Bool>();

  public query ({ caller }) func getModules() : async [Module] {
    htmlModules;
  };

  public query ({ caller }) func getUserProgress() : async UserProgress {
    {
      completedLessons = completedLessons.keys().toArray();
      quizScores = quizScores.entries().toArray();
    };
  };

  public shared ({ caller }) func markLessonComplete(lessonId : Text) : async () {
    completedLessons.add(lessonId, true);
  };

  public shared ({ caller }) func submitQuizAnswer(lessonId : Text, answerId : Nat) : async Bool {
    let correct = switch (findLesson(lessonId)) {
      case (null) { Runtime.trap("Lesson not found") };
      case (?lesson) { answerId == lesson.quiz.correctIndex };
    };
    quizScores.add(lessonId, correct);
    correct;
  };

  public shared ({ caller }) func resetProgress() : async () {
    completedLessons.clear();
    quizScores.clear();
  };

  func findLesson(lessonId : Text) : ?Lesson {
    for (htmlModule in htmlModules.values()) {
      for (lesson in htmlModule.lessons.values()) {
        if (lesson.id == lessonId) {
          return ?lesson;
        };
      };
    };
    null;
  };
};
