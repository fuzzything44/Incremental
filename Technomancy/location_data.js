/*
* List of locations
* Each location has a name and some various encounters that can happen.
* An encounter consists of the following:
*   condition(): Can the encounter actually happen? If not, removed from the options when selecting an encounter.
*   run_encounter(): Actually runs the encounter.
*   weight: How relatively likely it is to happen. Note that 0 weight is treated specially - it WILL happen. Other than that, all weights are added and rolled for the encounter.
*   title: what the top gets set to.
*   types: What types of encounter so some ones can be selectively removed. List of string types. Current types are:
*       combat              noncombat
*
*/
//# sourceMappingURL=location_data.js.map