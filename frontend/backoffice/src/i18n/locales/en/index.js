import common from "./common";
import users from "./users";
import contacts from "./contacts";
import payments from "./payments";
import pages from "./pages";
import content from "./content";
import navigation from "./navigation";
import settings from "./settings";
import organization from "./organization";
import site from "./site";

export default {...common, ...navigation, ...settings, ...organization, ...site, ...users, ...contacts, ...payments, ...pages, ...content};
