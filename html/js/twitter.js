var CurrentbirdyTab = "birdy-home"
var HashtagOpen = false;
var MinimumTrending = 100;

$(document).on('click', '.birdy-header-tab', function(e){
    e.preventDefault();

    var PressedbirdyTab = $(this).data('birdytab');
    var PreviousbirdyTabObject = $('.birdy-header').find('[data-birdytab="'+CurrentbirdyTab+'"]');

    if (PressedbirdyTab !== CurrentbirdyTab) {
        $(this).addClass('selected-birdy-header-tab');
        $(PreviousbirdyTabObject).removeClass('selected-birdy-header-tab');

        $("."+CurrentbirdyTab+"-tab").css({"display":"none"});
        $("."+PressedbirdyTab+"-tab").css({"display":"block"});

        if (PressedbirdyTab === "birdy-mentions") {
            $.post('https://qb-phone/ClearMentions');
        }

        if (PressedbirdyTab == "birdy-home") {
            $.post('https://qb-phone/GetTweets', JSON.stringify({}), function(Tweets){
                QB.Phone.Notifications.LoadTweets(Tweets);
            });
        }

        CurrentbirdyTab = PressedbirdyTab;

        if (HashtagOpen) {
            event.preventDefault();

            $(".birdy-hashtag-tweets").css({"left": "30vh"});
            $(".birdy-hashtags").css({"left": "0vh"});
            $(".birdy-new-tweet").css({"display":"block"});
            $(".birdy-hashtags").css({"display":"block"});
            HashtagOpen = false;
        }
    } else if (CurrentbirdyTab == "birdy-hashtags" && PressedbirdyTab == "birdy-hashtags") {
        if (HashtagOpen) {
            event.preventDefault();

            $(".birdy-hashtags").css({"display":"block"});
            $(".birdy-hashtag-tweets").animate({
                left: 30+"vh"
            }, 150);
            $(".birdy-hashtags").animate({
                left: 0+"vh"
            }, 150);
            HashtagOpen = false;
        }
    } else if (CurrentbirdyTab == "birdy-home" && PressedbirdyTab == "birdy-home") {
        event.preventDefault();

        $.post('https://qb-phone/GetTweets', JSON.stringify({}), function(Tweets){
            QB.Phone.Notifications.LoadTweets(Tweets);
        });
    } else if (CurrentbirdyTab == "birdy-mentions" && PressedbirdyTab == "birdy-mentions") {
        event.preventDefault();

        $.post('https://qb-phone/GetMentionedTweets', JSON.stringify({}), function(MentionedTweets){
            QB.Phone.Notifications.LoadMentionedTweets(MentionedTweets)
        })
    }
});

$(document).on('click', '.birdy-new-tweet', function(e){
    e.preventDefault();

    QB.Phone.Animations.TopSlideDown(".birdy-new-tweet-tab", 450, 0);
});

$(document).on('click', '#take-pic', function (e) {
    e.preventDefault();
    $.post('https://qb-phone/TakePhoto', JSON.stringify({}),function(url){
        if(url){
            $('#tweet-new-url').val(url)
        }
    })
    QB.Phone.Functions.Close();
})

QB.Phone.Notifications.LoadTweets = function(Tweets) {
    Tweets = Tweets.reverse();
    if (Tweets !== null && Tweets !== undefined && Tweets !== "" && Tweets.length > 0) {
        $(".birdy-home-tab").html("");
        $.each(Tweets, function(i, Tweet){
            var clean = DOMPurify.sanitize(Tweet.message , {
                ALLOWED_TAGS: [],
                ALLOWED_ATTR: []
            });
            if (clean == '') clean = 'Hmm, I shouldn\'t be able to do this...'
            var TwtMessage = QB.Phone.Functions.FormatbirdyMessage(clean);
            var TimeAgo = moment(Tweet.date).format('MM/DD/YYYY hh:mm');

            var birdyHandle = Tweet.firstName + ' ' + Tweet.lastName
            var PictureUrl = "./img/avatar.png"
            if (Tweet.picture !== "default") {
                PictureUrl = Tweet.picture
            }

            if (Tweet.url == "") {
                let TweetElement = '<div class="birdy-tweet" data-twtcid="'+Tweet.citizenid+'" data-twtid ="'+Tweet.tweetId+'" data-twthandler="@' + birdyHandle.replace(" ", "_") + '"><div class="tweet-reply"><i class="fas fa-reply"></i></div>' +
                    '<div class="tweet-tweeter">' + Tweet.firstName + ' ' + Tweet.lastName + ' &nbsp;<span>@' + birdyHandle.replace(" ", "_") + ' &middot; ' + TimeAgo + '</span></div>' +
                    '<div class="tweet-message">' + TwtMessage + '</div>' +
                    '<div class="twt-img" style="top: 1vh;"><img src="' + PictureUrl + '" class="tweeter-image"></div>' +
                    '</div>';
                    $(".birdy-home-tab").append(TweetElement);
            } else {
                let TweetElement = '<div class="birdy-tweet" data-twthandler="@'+birdyHandle.replace(" ", "_")+'"><div class="tweet-reply"><i class="fas fa-reply"></i></div>'+
                    '<div class="tweet-tweeter">'+Tweet.firstName+' '+Tweet.lastName+' &nbsp;<span>@'+birdyHandle.replace(" ", "_")+' &middot; '+TimeAgo+'</span></div>'+
                    '<div class="tweet-message">'+TwtMessage+'</div>'+
                    '<img class="image" src= ' + Tweet.url + ' style = " border-radius:4px; width: 70%; position:relative; z-index: 1; left:52px; margin:.6rem .5rem .6rem 1rem;height: auto; padding-bottom: 15px;">' +
                    '<div class="twt-img" style="top: 1vh;"><img src="'+PictureUrl+'" class="tweeter-image"></div>' +
                    '</div>';
                $(".birdy-home-tab").append(TweetElement);
            }
            // if (Tweet.citizenid === QB.Phone.Data.PlayerData.citizenid){
            //     $(".tweet-message").append('<span><div class="twt-icon"><i class="fas fa-trash"style="position:absolute; right:2%; font-size: 1.5rem; z-index:4;" id ="twt-delete-click"></i></div>')
            // }
        });
    }
}

$(document).on('click','#twt-delete-click',function(e){
    e.preventDefault();
    let source = $('.birdy-tweet').data('twtid')
    $(this).parent().parent().parent().parent().remove()
    $.post('https://qb-phone/DeleteTweet', JSON.stringify({id: source}))
})

$(document).on('click', '.tweet-reply', function(e){
    e.preventDefault();
    var TwtName = $(this).parent().data('twthandler');
    $('#tweet-new-url').val("");
    $("#tweet-new-message").val(TwtName + " ");
    QB.Phone.Animations.TopSlideDown(".birdy-new-tweet-tab", 450, 0);
});

QB.Phone.Notifications.LoadMentionedTweets = function(Tweets) {
    Tweets = Tweets.reverse();
    $('#tweet-new-url').val("");
    if (Tweets.length > 0) {
        $(".birdy-mentions-tab").html("");
        $.each(Tweets, function(i, Tweet){
            var clean = DOMPurify.sanitize(Tweet.message , {
                ALLOWED_TAGS: [],
                ALLOWED_ATTR: []
            });
            if (clean == '') clean = 'Hmm, I shouldn\'t be able to do this...'
            var TwtMessage = QB.Phone.Functions.FormatbirdyMessage(clean);
            var TimeAgo = moment(Tweet.date).format('MM/DD/YYYY hh:mm');

            var birdyHandle = Tweet.firstName + ' ' + Tweet.lastName
            var PictureUrl = "./img/avatar.png";
            if (Tweet.picture !== "default") {
                PictureUrl = Tweet.picture
            }

            var TweetElement =
            '<div class="birdy-tweet">'+
                '<div class="tweet-tweeter">'+Tweet.firstName+' '+Tweet.lastName+' &nbsp;<span>@'+birdyHandle.replace(" ", "_")+' &middot; '+TimeAgo+'</span></div>'+
                '<div class="tweet-message">'+TwtMessage+'</div>'+
            '<div class="twt-img" style="top: 1vh;"><img src="'+PictureUrl+'" class="tweeter-image"></div></div>';

            $(".birdy-mentioned-tweet").css({"background-color":"#F5F8FA"});
            $(".birdy-mentions-tab").append(TweetElement);
        });
    }
}

QB.Phone.Functions.FormatbirdyMessage = function(birdyMessage) {
    var TwtMessage = birdyMessage;
    var res = TwtMessage.split("@");
    var tags = TwtMessage.split("#");
    var InvalidSymbols = [
        "[",
        "?",
        "!",
        "@",
        "#",
        "]",
    ]

    for(i = 1; i < res.length; i++) {
        var MentionTag = res[i].split(" ")[0];
        if (MentionTag !== null && MentionTag !== undefined && MentionTag !== "") {
            TwtMessage = TwtMessage.replace("@"+MentionTag, "<span class='mentioned-tag' data-mentiontag='@"+MentionTag+"''>@"+MentionTag+"</span>");
        }
    }

    for(i = 1; i < tags.length; i++) {
        var Hashtag = tags[i].split(" ")[0];

        for(i = 1; i < InvalidSymbols.length; i++){
            var symbol = InvalidSymbols[i];
            var res = Hashtag.indexOf(symbol);

            if (res > -1) {
                Hashtag = Hashtag.replace(symbol, "");
            }
        }

        if (Hashtag !== null && Hashtag !== undefined && Hashtag !== "") {
            TwtMessage = TwtMessage.replace("#"+Hashtag, "<span class='hashtag-tag-text' data-hashtag='"+Hashtag+"''>#"+Hashtag+"</span>");
        }
    }

    return TwtMessage
}

$(document).on('click', '#send-tweet', function(e){
    e.preventDefault();
    var TweetMessage = $("#tweet-new-message").val();
    var imageURL = $('#tweet-new-url').val()
    if (TweetMessage != "") {
        var CurrentDate = new Date();
        $.post('https://qb-phone/PostNewTweet', JSON.stringify({
            Message: TweetMessage,
            Date: CurrentDate,
            Picture: QB.Phone.Data.MetaData.profilepicture,
            url: imageURL
        }), function(Tweets){
            QB.Phone.Notifications.LoadTweets(Tweets);
        });
        $.post('https://qb-phone/GetHashtags', JSON.stringify({}), function(Hashtags){
            QB.Phone.Notifications.LoadHashtags(Hashtags)
        })
        QB.Phone.Animations.TopSlideUp(".birdy-new-tweet-tab", 450, -120);
    } else {
        QB.Phone.Notifications.Add("fab fa-birdy", "birdy", "Fill a message!", "#1DA1F2");
    };
    $('#tweet-new-url').val("");
    $("#tweet-new-message").val("");
});

$(document).on('click', '#cancel-tweet', function(e){
    e.preventDefault();
    $('#tweet-new-url').html("");
    QB.Phone.Animations.TopSlideUp(".birdy-new-tweet-tab", 450, -120);
});

$(document).on('click', '.image', function(e){
    e.preventDefault();
    let source = $(this).attr('src')
    QB.Screen.popUp(source)
});

$(document).on('click', '.mentioned-tag', function(e){
    e.preventDefault();
    CopyMentionTag(this);
});

$(document).on('click', '.hashtag-tag-text', function(e){
    e.preventDefault();
    if (!HashtagOpen) {
        var Hashtag = $(this).data('hashtag');
        var PreviousbirdyTabObject = $('.birdy-header').find('[data-birdytab="'+CurrentbirdyTab+'"]');

        $("#birdy-hashtags").addClass('selected-birdy-header-tab');
        $(PreviousbirdyTabObject).removeClass('selected-birdy-header-tab');

        $("."+CurrentbirdyTab+"-tab").css({"display":"none"});
        $(".birdy-hashtags-tab").css({"display":"block"});

        $.post('https://qb-phone/GetHashtagMessages', JSON.stringify({hashtag: Hashtag}), function(HashtagData){
            QB.Phone.Notifications.LoadHashtagMessages(HashtagData.messages);
        });

        $(".birdy-hashtag-tweets").css({"display":"block", "left":"30vh"});
        $(".birdy-hashtag-tweets").css({"left": "0vh"});
        $(".birdy-hashtags").css({"left": "-30vh"});
        $(".birdy-hashtags").css({"display":"none"});
        HashtagOpen = true;

        CurrentbirdyTab = "birdy-hashtags";
    }
});

function CopyMentionTag(elem) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val($(elem).data('mentiontag')).select();
    QB.Phone.Notifications.Add("fab fa-birdy", "birdy", $(elem).data('mentiontag')+ " copied!", "rgb(27, 149, 224)", 1250);
    document.execCommand("copy");
    $temp.remove();
}

QB.Phone.Notifications.LoadHashtags = function(hashtags) {
    if (hashtags !== null) {
        $(".birdy-hashtags").html("");

        $.each(hashtags, function(i, hashtag){
            var Elem = '';
            var TweetHandle = "Tweet";
            if (hashtag.messages.length > 1 ) {
               TweetHandle = "Tweets";
            }
            if (hashtag.messages.length >= MinimumTrending) {
                Elem = '<div class="birdy-hashtag" id="tag-'+hashtag.hashtag+'"><div class="birdy-hashtag-status">Trending in City</div> <div class="birdy-hashtag-tag">#'+hashtag.hashtag+'</div> <div class="birdy-hashtag-messages">'+hashtag.messages.length+' '+TweetHandle+'</div> </div>';
            } else {
                Elem = '<div class="birdy-hashtag" id="tag-'+hashtag.hashtag+'"><div class="birdy-hashtag-status">Not trending in City</div> <div class="birdy-hashtag-tag">#'+hashtag.hashtag+'</div> <div class="birdy-hashtag-messages">'+hashtag.messages.length+' '+TweetHandle+'</div> </div>';
            }

            $(".birdy-hashtags").append(Elem);
            $("#tag-"+hashtag.hashtag).data('tagData', hashtag);
        });
    }
}

QB.Phone.Notifications.LoadHashtagMessages = function(Tweets) {
    Tweets = Tweets.reverse();
    if (Tweets !== null && Tweets !== undefined && Tweets !== "" && Tweets.length > 0) {
        $(".birdy-hashtag-tweets").html("");
        $.each(Tweets, function(i, Tweet){
            var clean = DOMPurify.sanitize(Tweet.message , {
                ALLOWED_TAGS: [],
                ALLOWED_ATTR: []
            });
            if (clean == '') clean = 'Hmm, I shouldn\'t be able to do this...'
            var TwtMessage = QB.Phone.Functions.FormatbirdyMessage(clean);
            var TimeAgo = moment(Tweet.date).format('MM/DD/YYYY hh:mm');

            var birdyHandle = Tweet.firstName + ' ' + Tweet.lastName
            var PictureUrl = "./img/avatar.png"
            if (Tweet.picture !== "default") {
                PictureUrl = Tweet.picture
            }

            var TweetElement =
            '<div class="birdy-tweet">'+
                '<div class="tweet-tweeter">'+Tweet.firstName+' '+Tweet.lastName+' &nbsp;<span>@'+birdyHandle.replace(" ", "_")+' &middot; '+TimeAgo+'</span></div>'+
                '<div class="tweet-message">'+TwtMessage+'</div>'+
            '<div class="twt-img" style="top: 1vh;"><img src="'+PictureUrl+'" class="tweeter-image"></div></div>';

            $(".birdy-hashtag-tweets").append(TweetElement);
        });
    }
}


$(document).on('click', '.birdy-hashtag', function(event){
    event.preventDefault();

    var TweetId = $(this).attr('id');
    var TweetData = $("#"+TweetId).data('tagData');

    QB.Phone.Notifications.LoadHashtagMessages(TweetData.messages);

    $(".birdy-hashtag-tweets").css({"display":"block", "left":"30vh"});
    $(".birdy-hashtag-tweets").animate({
        left: 0+"vh"
    }, 150);
    $(".birdy-hashtags").animate({
        left: -30+"vh"
    }, 150, function(){
        $(".birdy-hashtags").css({"display":"none"});
    });
    HashtagOpen = true;
});
