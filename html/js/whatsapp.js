var chitchatSearchActive = false;
var OpenedChatPicture = null;
var ExtraButtonsOpen = false;

$(document).ready(function(){
    $("#chitchat-search-input").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        $(".chitchat-chats .chitchat-chat").filter(function() {
          $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    });
});

$(document).on('click', '#chitchat-search-chats', function(e){
    e.preventDefault();

    if ($("#chitchat-search-input").css('display') == "none") {
        $("#chitchat-search-input").fadeIn(150);
        chitchatSearchActive = true;
    } else {
        $("#chitchat-search-input").fadeOut(150);
        chitchatSearchActive = false;
    }
});

$(document).on('click', '.chitchat-chat', function(e){
    e.preventDefault();

    var ChatId = $(this).attr('id');
    var ChatData = $("#"+ChatId).data('chatdata');

    QB.Phone.Functions.SetupChatMessages(ChatData);

    $.post('https://qb-phone/ClearAlerts', JSON.stringify({
        number: ChatData.number
    }));

    if (chitchatSearchActive) {
        $("#chitchat-search-input").fadeOut(150);
    }

    $(".chitchat-openedchat").css({"display":"block"});
    $(".chitchat-openedchat").animate({
        left: 0+"vh"
    },200);

    $(".chitchat-chats").animate({
        left: 30+"vh"
    },200, function(){
        $(".chitchat-chats").css({"display":"none"});
    });

    $('.chitchat-openedchat-messages').animate({scrollTop: 9999}, 150);

    if (OpenedChatPicture == null) {
        OpenedChatPicture = "./img/avatar.png";
        if (ChatData.picture != null || ChatData.picture != undefined || ChatData.picture != "default") {
            OpenedChatPicture = ChatData.picture
        }
        $(".chitchat-openedchat-picture").css({"background-image":"url("+OpenedChatPicture+")"});
    }
});

$(document).on('click', '#chitchat-openedchat-back', function(e){
    e.preventDefault();
    $.post('https://qb-phone/GetchitchatChats', JSON.stringify({}), function(chats){
        QB.Phone.Functions.LoadchitchatChats(chats);
    });
    OpenedChatData.number = null;
    $(".chitchat-chats").css({"display":"block"});
    $(".chitchat-chats").animate({
        left: 0+"vh"
    }, 200);
    $(".chitchat-openedchat").animate({
        left: -30+"vh"
    }, 200, function(){
        $(".chitchat-openedchat").css({"display":"none"});
    });
    OpenedChatPicture = null;
});

QB.Phone.Functions.GetLastMessage = function(messages) {
    var CurrentDate = new Date();
    var CurrentMonth = CurrentDate.getMonth();
    var CurrentDOM = CurrentDate.getDate();
    var CurrentYear = CurrentDate.getFullYear();
    var LastMessageData = {
        time: "00:00",
        message: "nothing"
    }

    $.each(messages[messages.length - 1], function(i, msg){
        var msgData = msg[msg.length - 1];
        LastMessageData.time = msgData.time
        LastMessageData.message = DOMPurify.sanitize(msgData.message , {
            ALLOWED_TAGS: [],
            ALLOWED_ATTR: []
        });
        if(LastMessageData.message == '') 'Hmm, I shouldn\'t be able to do this...'
    });

    return LastMessageData
}

GetCurrentDateKey = function() {
    var CurrentDate = new Date();
    var CurrentMonth = CurrentDate.getMonth();
    var CurrentDOM = CurrentDate.getDate();
    var CurrentYear = CurrentDate.getFullYear();
    var CurDate = ""+CurrentDOM+"-"+CurrentMonth+"-"+CurrentYear+"";

    return CurDate;
}

QB.Phone.Functions.LoadchitchatChats = function(chats) {
    $(".chitchat-chats").html("");
    $.each(chats, function(i, chat){
        var profilepicture = "./img/avatar.png";
        if (chat.picture !== "default") {
            profilepicture = chat.picture
        }
        var LastMessage = QB.Phone.Functions.GetLastMessage(chat.messages);
        var ChatElement = '<div class="chitchat-chat" id="chitchat-chat-'+i+'"><div class="chitchat-chat-picture" style="background-image: url('+profilepicture+');"></div><div class="chitchat-chat-name"><p>'+chat.name+'</p></div><div class="chitchat-chat-lastmessage"><p>'+LastMessage.message+'</p></div> <div class="chitchat-chat-lastmessagetime"><p>'+LastMessage.time+'</p></div><div class="chitchat-chat-unreadmessages unread-chat-id-'+i+'">1</div></div>';

        $(".chitchat-chats").append(ChatElement);
        $("#chitchat-chat-"+i).data('chatdata', chat);

        if (chat.Unread > 0 && chat.Unread !== undefined && chat.Unread !== null) {
            $(".unread-chat-id-"+i).html(chat.Unread);
            $(".unread-chat-id-"+i).css({"display":"block"});
        } else {
            $(".unread-chat-id-"+i).css({"display":"none"});
        }
    });
}

QB.Phone.Functions.ReloadchitchatAlerts = function(chats) {
    $.each(chats, function(i, chat){
        if (chat.Unread > 0 && chat.Unread !== undefined && chat.Unread !== null) {
            $(".unread-chat-id-"+i).html(chat.Unread);
            $(".unread-chat-id-"+i).css({"display":"block"});
        } else {
            $(".unread-chat-id-"+i).css({"display":"none"});
        }
    });
}

const monthNames = ["January", "February", "March", "April", "May", "June", "JulY", "August", "September", "October", "November", "December"];

FormatChatDate = function(date) {
    var TestDate = date.split("-");
    var NewDate = new Date((parseInt(TestDate[1]) + 1)+"-"+TestDate[0]+"-"+TestDate[2]);

    var CurrentMonth = monthNames[NewDate.getMonth()];
    var CurrentDOM = NewDate.getDate();
    var CurrentYear = NewDate.getFullYear();
    var CurDateee = CurrentDOM + "-" + NewDate.getMonth() + "-" + CurrentYear;
    var ChatDate = CurrentDOM + " " + CurrentMonth + " " + CurrentYear;
    var CurrentDate = GetCurrentDateKey();

    var ReturnedValue = ChatDate;
    if (CurrentDate == CurDateee) {
        ReturnedValue = "Today";
    }

    return ReturnedValue;
}

FormatMessageTime = function() {
    var NewDate = new Date();
    var NewHour = NewDate.getHours();
    var NewMinute = NewDate.getMinutes();
    var Minutessss = NewMinute;
    var Hourssssss = NewHour;
    if (NewMinute < 10) {
        Minutessss = "0" + NewMinute;
    }
    if (NewHour < 10) {
        Hourssssss = "0" + NewHour;
    }
    var MessageTime = Hourssssss + ":" + Minutessss
    return MessageTime;
}

$(document).on('click', '#chitchat-openedchat-send', function(e){
    e.preventDefault();

    var Message = $("#chitchat-openedchat-message").val();

    if (Message !== null && Message !== undefined && Message !== "") {
        $.post('https://qb-phone/SendMessage', JSON.stringify({
            ChatNumber: OpenedChatData.number,
            ChatDate: GetCurrentDateKey(),
            ChatMessage: Message,
            ChatTime: FormatMessageTime(),
            ChatType: "message",
        }));
        $("#chitchat-openedchat-message").val("");
        $("div.emojionearea-editor").data("emojioneArea").setText('');
    } else {
        QB.Phone.Notifications.Add("fab fa-chitchat", "chitchat", "You can't send a empty message!", "#25D366", 1750);
    }
});

$(document).on('keypress', function (e) {
    if (OpenedChatData.number !== null) {
        if(e.which === 13){
            var Message = $("#chitchat-openedchat-message").val();

            if (Message !== null && Message !== undefined && Message !== "") {
                var clean = DOMPurify.sanitize(Message , {
                    ALLOWED_TAGS: [],
                    ALLOWED_ATTR: []
                });
                if (clean == '') clean = 'Hmm, I shouldn\'t be able to do this...'
                $.post('https://qb-phone/SendMessage', JSON.stringify({
                    ChatNumber: OpenedChatData.number,
                    ChatDate: GetCurrentDateKey(),
                    ChatMessage: clean,
                    ChatTime: FormatMessageTime(),
                    ChatType: "message",
                }));
                $("#chitchat-openedchat-message").val("");
            } else {
                QB.Phone.Notifications.Add("fab fa-chitchat", "chitchat", "You can't send a empty message!", "#25D366", 1750);
            }
        }
    }
});

$(document).on('click', '#send-location', function(e){
    e.preventDefault();

    $.post('https://qb-phone/SendMessage', JSON.stringify({
        ChatNumber: OpenedChatData.number,
        ChatDate: GetCurrentDateKey(),
        ChatMessage: "Shared location",
        ChatTime: FormatMessageTime(),
        ChatType: "location",
    }));
});

$(document).on('click', '#send-image', function(e){
    e.preventDefault();
    let ChatNumber2 = OpenedChatData.number;
    $.post('https://qb-phone/TakePhoto', JSON.stringify({}),function(url){
        if(url){
        $.post('https://qb-phone/SendMessage', JSON.stringify({
        ChatNumber: ChatNumber2,
        ChatDate: GetCurrentDateKey(),
        ChatMessage: "Photo",
        ChatTime: FormatMessageTime(),
        ChatType: "picture",
        url : url
    }))}})
    QB.Phone.Functions.Close();
});

QB.Phone.Functions.SetupChatMessages = function(cData, NewChatData) {
    if (cData) {
        OpenedChatData.number = cData.number;

        if (OpenedChatPicture == null) {
            $.post('https://qb-phone/GetProfilePicture', JSON.stringify({
                number: OpenedChatData.number,
            }), function(picture){
                OpenedChatPicture = "./img/avatar.png";
                if (picture != "default" && picture != null) {
                    OpenedChatPicture = picture
                }
                $(".chitchat-openedchat-picture").css({"background-image":"url("+OpenedChatPicture+")"});
            });
        } else {
            $(".chitchat-openedchat-picture").css({"background-image":"url("+OpenedChatPicture+")"});
        }

        $(".chitchat-openedchat-name").html("<p>"+cData.name+"</p>");
        $(".chitchat-openedchat-messages").html("");

        $.each(cData.messages, function(i, chat){

            var ChatDate = FormatChatDate(chat.date);
            var ChatDiv = '<div class="chitchat-openedchat-messages-'+i+' unique-chat"><div class="chitchat-openedchat-date">'+ChatDate+'</div></div>';

            $(".chitchat-openedchat-messages").append(ChatDiv);

            $.each(cData.messages[i].messages, function(index, message){
                message.message = DOMPurify.sanitize(message.message , {
                    ALLOWED_TAGS: [],
                    ALLOWED_ATTR: []
                });
                if (message.message == '') message.message = 'Hmm, I shouldn\'t be able to do this...'
                var Sender = "me";
                if (message.sender !== QB.Phone.Data.PlayerData.citizenid) { Sender = "other"; }
                var MessageElement
                if (message.type == "message") {
                    MessageElement = '<div class="chitchat-openedchat-message chitchat-openedchat-message-'+Sender+'">'+message.message+'<div class="chitchat-openedchat-message-time">'+message.time+'</div></div><div class="clearfix"></div>'
                } else if (message.type == "location") {
                    MessageElement = '<div class="chitchat-openedchat-message chitchat-openedchat-message-'+Sender+' chitchat-shared-location" data-x="'+message.data.x+'" data-y="'+message.data.y+'"><span style="font-size: 1.2vh;"><i class="fas fa-map-marker-alt" style="font-size: 1vh;"></i> Location</span><div class="chitchat-openedchat-message-time">'+message.time+'</div></div><div class="clearfix"></div>'
                } else if (message.type == "picture") {
                    MessageElement = '<div class="chitchat-openedchat-message chitchat-openedchat-message-'+Sender+'" data-id='+OpenedChatData.number+'><img class="wppimage" src='+message.data.url +'  style=" border-radius:4px; width: 100%; position:relative; z-index: 1; right:1px;height: auto;"></div><div class="chitchat-openedchat-message-time">'+message.time+'</div></div><div class="clearfix"></div>'
                }
                $(".chitchat-openedchat-messages-"+i).append(MessageElement);
            });
        });
        $('.chitchat-openedchat-messages').animate({scrollTop: 9999}, 1);
    } else {
        OpenedChatData.number = NewChatData.number;
        if (OpenedChatPicture == null) {
            $.post('https://qb-phone/GetProfilePicture', JSON.stringify({
                number: OpenedChatData.number,
            }), function(picture){
                OpenedChatPicture = "./img/avatar.png";
                if (picture != "default" && picture != null) {
                    OpenedChatPicture = picture
                }
                $(".chitchat-openedchat-picture").css({"background-image":"url("+OpenedChatPicture+")"});
            });
        }

        $(".chitchat-openedchat-name").html("<p>"+NewChatData.name+"</p>");
        $(".chitchat-openedchat-messages").html("");
        var NewDate = new Date();
        var NewDateMonth = NewDate.getMonth();
        var NewDateDOM = NewDate.getDate();
        var NewDateYear = NewDate.getFullYear();
        var DateString = ""+NewDateDOM+"-"+(NewDateMonth+1)+"-"+NewDateYear;
        var ChatDiv = '<div class="chitchat-openedchat-messages-'+DateString+' unique-chat"><div class="chitchat-openedchat-date">TODAY</div></div>';

        $(".chitchat-openedchat-messages").append(ChatDiv);
    }

    $('.chitchat-openedchat-messages').animate({scrollTop: 9999}, 1);
}

$(document).on('click', '.chitchat-shared-location', function(e){
    e.preventDefault();
    var messageCoords = {}
    messageCoords.x = $(this).data('x');
    messageCoords.y = $(this).data('y');

    $.post('https://qb-phone/SharedLocation', JSON.stringify({
        coords: messageCoords,
    }))
});

$(document).on('click', '.wppimage', function(e){
    e.preventDefault();
    let source = $(this).attr('src')
   QB.Screen.popUp(source)
});

$(document).on('click', '#chitchat-openedchat-message-extras', function(e){
    e.preventDefault();

    if (!ExtraButtonsOpen) {
        $(".chitchat-extra-buttons").css({"display":"block"}).animate({
            left: 0+"vh"
        }, 250);
        ExtraButtonsOpen = true;
    } else {
        $(".chitchat-extra-buttons").animate({
            left: -10+"vh"
        }, 250, function(){
            $(".chitchat-extra-buttons").css({"display":"block"});
            ExtraButtonsOpen = false;
        });
    }
});
