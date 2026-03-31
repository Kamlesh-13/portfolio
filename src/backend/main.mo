import Iter "mo:core/Iter";
import List "mo:core/List";
import Migration "migration";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";

(with migration = Migration.run)
actor {
  type Message = {
    text : Text;
    name : Text;
    email : Text;
    id : Nat;
  };

  let messageList = List.empty<Message>();
  var idCounter = 0;
  var adminId : ?Principal = null;

  func getMessageByIdInternal(id : Nat) : ?Message {
    messageList.values().find(func(message) { id == message.id });
  };

  func getMessageByIdInternalOrTrap(id : Nat) : Message {
    switch (getMessageByIdInternal(id)) {
      case (null) { Runtime.trap("Message not found") };
      case (?message) { message };
    };
  };

  public shared ({ caller }) func addMessage(text : Text, name : Text, email : Text) : async Nat {
    let message : Message = {
      text;
      name;
      email;
      id = idCounter;
    };
    messageList.add(message);
    idCounter += 1;
    idCounter - 1;
  };

  public query ({ caller }) func getMessageById(id : Nat) : async Message {
    getMessageByIdInternalOrTrap(id);
  };

  public query ({ caller }) func getMessagesByName(name : Text) : async [Message] {
    messageList.filter(func(message) { message.name == name }).toArray();
  };

  public query ({ caller }) func getCurrentMessage(id : Nat) : async ?Message {
    getMessageByIdInternal(id);
  };

  public query ({ caller }) func getMessages() : async [Message] {
    messageList.toArray();
  };
};
