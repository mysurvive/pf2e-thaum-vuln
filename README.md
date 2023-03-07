# PF2e Exploit Vulnerability

Project manifest URL: https://github.com/mysurvive/pf2e-thaum-vuln/releases/latest/download/module.json
<br><br>
Improvement for Thaumaturge Exploit Vulnerability

This project is a carryover until the pf2e system for Foundry VTT implements Thaumaturge Exploit Vulnerability

## IMPORTANT!!!

<strong>Make sure actors are assigned to players!</strong><br>
<strong>IWR must be turned on in the PF2e Core Automation Settings or damage will not be applied properly</strong><br>
<strong>A thaumaturge's Esoteric Lore entry must be listed as Esoteric Lore or it will not work</strong>
![Esoteric Lore Skill](src/assets/esotericLore.png)

## Functionality

### Feats

<ul>
<li> Diverse Lore: A secret message is sent to the GM on a successful or critically successful Exploit Vulnerability roll, comparing the result of the roll to the hard DC for the creature and providing guidance per the CRB,
<li> Breached Defenses: Mostly works except in cases where the highest bypassable resistance is a combination of two traits (such as an adamantine golem's resistance to Vorpal Adamantine damage) or when the damage is not part of the PF2E system's known traits
<li> Esoteric Warden: Benefits granted upon a successful or critically successful Exploit Vulnerability roll. Per the rules, you cannot gain the benefit of Esoteric Warden from the same creature until you rest for the night.
<li> Sympathetic Vulnerabilities: Mortal Weakness or Personal Antithesis are automatically applied to all appropriate tokens on the scene. You can disable this by turning off the "Use Exploit Vulnerability Automation" setting in the module Settings.
<li> Share Weakness: A dialog box with buttons to choose party members to share weakness with. It grabs all allied tokens on the scene, so if the token you are looking for isn't in the dialog box check its alliance status.
</ul>

This is a work in progress.

1. Import the Exploit Vulnerability macro from the "MySurvive's Thaumaturge Macros" compendium and give the player the proper permissions to execute the macro.
2. The player should drag the macro onto their hotbar.
3. The player must target exactly one enemy on the screen, then run the macro.
4. The macro will roll the Esoteric Lore check and compare it to the target's level DC. It will determine the degree of success and automate the effects.

Critical Success: The player will receive a dialog window that provides all weaknesses, resistances, and immunities, if there are any. They will be able to choose whether they want to exploit a personal antithesis or a mortal weakness, providing them with values at a quick glance to show which is higher. Making a choice will apply an effect to them (Exploit Mortal Weakness TARGET NAME or Exploit Personal Antithesis TARGET NAME) and to the enemeny (Mortal Weakness Effect (SOURCE NAME) or Personal Antithesis Effect (SOURCE NAME)).

Success: The player will receive a dialog window that provides the highest weakness of the target, if there is one. Like on a critical success, it will provide values at a quick glance that will show which is higher and apply appropriate effects based on choice in the dialog.

Failure: The Personal Antithesis effects will be added tot he player and the target.

Critical Failure: A flat-footed effect will be applied to the player that will drop off at the beginning of their next turn.

![Apply Effect](src/assets/applyEffect.gif)

5. In the event that the player chooses to exploit a Mortal Weakness (or the sympathetic weakness feat), there is another macro for GMs to use that will apply the Mortal Weakness effect to additional targets that fit the criteria "enemies of the exact same type." Since Paizo doesn't explicitly state what qualifies as a creature type, or "exact same type," this has been provided in a macro for GMs to use at their discretion. However, the default behavior is for the module to apply the effect to all targets of the same name in the scene. Simply target the actors that should have the effect (I recommend using shift+T to target multiple targets), select the thaumaturge that created the effect, and then run the "Force EV" macro from the "MySurvive's Thaumaturge Macros" compendium.

   ![Force EV](src/assets/forceEV.gif)

6. When the thaumaturge attacks, the value of the exploit vulnerability will only be added to their attacks, taking IWR into account.
   ![Apply Damage](src/assets/applyDamage.gif)

<br>
Relevant actions have buttons on their chat cards to run their respective macros (currently only Exploit Vulnerability and Share Weakness). See the below example:
<br>
![Share Weakness Chat Button](src/assets/chatcardbutton.webp)

## Settings

There are settings to turn on/off the

- Exploit Vulnerability automation: (On by default) This will stop the module from applying the effects of Personal Antithesis or Mortal Weakness to valid tokens on the scene. This setting is useful for if you want to manually set the Exploit Vulnerability targets via the forceEV macro.
- IWR Value Mystification: (Off by default) This will mystify the weakness values in the dialog box after using the Exploit Vulnerability macro.

## Reporting Issues

Please report any issues you find. I can't guarantee that I can get to them extremely quickly, but I will do my best.

### More Usage Clips

![Re-apply Effect](src/assets/reApplyEffect.gif)

![Force EV with Personal Antithesis](src/assets/moreForceEV.gif)

![Apply Damage](src/assets/applyDamage.gif)
