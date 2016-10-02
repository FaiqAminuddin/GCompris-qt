/* GCompris - Groups.qml
 *
 * Copyright (C) 2016 Johnny Jazeix <jazeix@gmail.com>
 *
 * Authors:
 *   Johnny Jazeix <jazeix@gmail.com>
 *
 *   This program is free software; you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation; either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program; if not, see <http://www.gnu.org/licenses/>.
 */
import QtQuick 2.1
import GCompris 1.0
import QtQuick.Controls 1.0

import "../../core"

ActivityBase {
    id: activity

    activityInfo: QtObject {
        property bool demo: false
    }

    pageComponent: Item {
        anchors.fill: parent
        GridView {
            id: clients
            width: activity.width
            height: activity.height
            cellWidth: 210
            cellHeight: cellWidth
            model: MessageHandler.groups
            highlight: Rectangle { color: "lightsteelblue"; radius: 5 }
            delegate: Rectangle {
                id: itemDelegate
                width: 200
                height: 200
                color: "red"
                property string name: modelData.name
                GCText {
                    text: modelData.name
                }

                MouseArea {
                    id: mouse
                    anchors.fill: parent
                    onClicked: { clients.currentIndex = index ; print(modelData.name) } // todo what do we do? display list of action? (update user list, send configuration?)
                }
            }
        }

        Grid {
            rows: 1
            anchors.bottom: bar.top
            Button {
                id: createGroupButton
                text: qsTr("Create a Group")
                style: GCButtonStyle {}
                onClicked: { createGroupName.visible = true; createGroupName.start(); }
            }

            Button {
                id: updateGroupButton
                text: qsTr("Update a Group")
                style: GCButtonStyle {}
                onClicked: { print("update group: " + clients.currentItem.name); }
                enabled: clients.currentIndex != -1
            }

            Button {
                id: sendConfiguration
                text: qsTr("Send user list")
                style: GCButtonStyle {}
                onClicked: {
                    print("select config and send config to: " + clients.currentItem.name);
                    Server.sendLoginList(MessageHandler.groups[clients.currentIndex]);
                }
                enabled: clients.currentIndex != -1
            }
        }
        GCInputDialog {
            id: createGroupName
            visible: false
            active: visible
            anchors.fill: parent
            z: 100
            message: qsTr("Name of the new group")
            onClose: createGroupName.visible = false;
            button1Text: qsTr("OK")
            button2Text: qsTr("Cancel")
            onButton1Hit: MessageHandler.createGroup(createGroupName.inputtedText)
            focus: true
            onStart: { inputItem.text = defaultText; inputItem.forceActiveFocus() }
            onStop: activity.forceActiveFocus()

            /**
             * type:string
             * inputted default text in the TextInput.
             */
            property string defaultText

            /**
             * type:string
             * inputted text in the TextInput.
             */
            property string inputtedText: inputItem ? inputItem.text : ""

            content: TextInput {
                id: inputItem
                height: 60 * ApplicationInfo.ratio
                //width: createGroupName.width
                horizontalAlignment: TextInput.AlignHCenter
                verticalAlignment: TextInput.AlignVCenter
                text: createGroupName.defaultText
                font.pointSize: 14
                font.weight: Font.DemiBold
            }
        }

        Bar {
            id: bar
            content: BarEnumContent { value: home }
            onHomeClicked: activity.home()
        }
    }
}