# pf2e-thaum-vuln
Improvement for Thaumaturge Exploit Vulnerability

This project is a carryover until the pf2e system for Foundry VTT implements Thaumaturge Exploit Vulnerability

## Functionality ##

There is currently no functionality with feats related to exploit vulnerability. This is a work in progress.

<strong>IMPORTANT!!! A thaumaturge's Esoteric Lore entry must be listed as Esoteric Lore or it will not work</strong>
![Esoteric Lore Skill](assets/esotericLore.png)

1. Import the Exploit Vulnerability macro from the "MySurvive's Thaumaturge Macros" compendium and give the player the proper permissions to execute the macro.
2. The player should drag the macro onto their hotbar.
3. The player must target exactly one enemy on the screen, then run the macro.
4. The macro will roll the Esoteric Lore check and compare it to the target's level DC. It will determine the degree of success and automate the effects.
  
  Critical Success: The player will receive a dialog window that provides all weaknesses, resistances, and immunities, if there are any. They will be able to choose whether they want to exploit a personal antithesis or a mortal weakness, providing them with values at a quick glance to show which is higher. Making a choice will apply an effect to them (Exploit Mortal Weakness TARGET NAME or Exploit Personal Antithesis TARGET NAME) and to the enemeny (Mortal Weakness Effect (SOURCE NAME) or Personal Antithesis Effect (SOURCE NAME)). 
  
  Success: The player will receive a dialog window that provides the highest weakness of the target, if there is one. Like on a critical success, it will provide values at a quick glance that will show which is higher and apply appropriate effects based on choice in the dialog.
  
  Failure: The Personal Antithesis effects will be added tot he player and the target.
  
  Critical Failure: A flat-footed effect will be applied to the player that will drop off at the beginning of their next turn.
  
  ![Apply Effect](assets/applyEffect.gif)
  
5. In the event that the player chooses to exploit a Mortal Weakness (or the sympathetic weakness feat), there is another macro for GMs to use that will apply the Mortal Weakness effect to additional targets that fit the criteria "enemies of the exact same type." Since Paizo doesn't explicitly state what qualifies as a creature type, or "exact same type," this has been provided in a macro for GMs to use at their discretion. Simply target the actors that should have the effect (I recommend using shift+T to target multiple targets), select the thaumaturge that created the effect, and then run the "Force EV" macro from the "MySurvive's Thaumaturge Macros" compendium.

	![Force EV](assets/forceEV.gif)

6. When the thaumaturge attacks, the value of the exploit vulnerability will only be added to their attacks, taking IWR into account.
![Apply Damage](assets/applyDamage.gif)

## Reporting Issues ##
Please report any issues you find. I can't guarantee that I can get to them extremely quickly, but I will do my best.

### More Usage Clips ###
![Re-apply Effect](assets/reApplyEffect.gif)

![Force EV with Personal Antithesis](assets/moreForceEV.gif)

![Apply Damage](assets/applyDamage.gif)

