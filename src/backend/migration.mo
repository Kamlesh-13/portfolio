import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  // Stable copy of old type definitions
  // List type is safe to reuse unchanged
  type OldLesson = {
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
  type OldModule = {
    id : Text;
    name : Text;
    lessons : [OldLesson];
  };
  type OldUserProgress = {
    completedLessons : [Text];
    quizScores : [(Text, Bool)];
  };

  // Actor types
  type OldActor = {
    completedLessons : Map.Map<Text, Bool>;
    quizScores : Map.Map<Text, Bool>;
    htmlModules : [OldModule];
  };
  type NewActor = {
    messageList : List.List<NewMessage>;
    idCounter : Nat;
    adminId : ?Principal;
  };

  // New message type
  type NewMessage = {
    text : Text;
    name : Text;
    email : Text;
    id : Nat;
  };

  // Migration function
  public func run(_old : OldActor) : NewActor {
    {
      messageList = List.empty<NewMessage>();
      idCounter = 0;
      adminId = null;
    };
  };
};
